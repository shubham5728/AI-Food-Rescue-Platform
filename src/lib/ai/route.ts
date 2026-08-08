import { haversineKm, travelMinutes } from "@/lib/geo";
import type {
  DemandHotspot,
  Donation,
  Organisation,
  RoutePlan,
  RouteStop,
} from "@/lib/types";
import { minutesBetween } from "@/lib/utils";

/**
 * AI feature #8 — collection route optimisation and demand hotspots.
 *
 * A volunteer with a scooter and four pickups does not want four separate
 * "shortest trip" answers; they want one order to drive them in. This builds
 * that order, then checks it against the deadlines — because the shortest
 * route is worthless if it arrives after the food has spoiled.
 *
 * Nearest-neighbour for the initial tour, then 2-opt to remove crossings.
 * Both are exact and fast at the sizes a single collection run ever reaches
 * (a dozen stops at most), so there is nothing probabilistic here.
 */

/** Minutes spent loading at each stop. */
const SERVICE_TIME_MIN = 8;

interface Point {
  latitude: number;
  longitude: number;
}

function legKm(a: Point, b: Point): number {
  return haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);
}

/** Total distance of a tour that starts at `origin` and visits stops in order. */
function tourKm(origin: Point, order: Donation[]): number {
  let total = 0;
  let cursor: Point = origin;
  for (const stop of order) {
    total += legKm(cursor, stop);
    cursor = stop;
  }
  return total;
}

/** Greedy nearest-neighbour tour from the origin. */
function nearestNeighbour(origin: Point, donations: Donation[]): Donation[] {
  const remaining = [...donations];
  const order: Donation[] = [];
  let cursor: Point = origin;

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestDistance = Infinity;
    remaining.forEach((candidate, index) => {
      const d = legKm(cursor, candidate);
      if (d < bestDistance) {
        bestDistance = d;
        bestIndex = index;
      }
    });
    const [next] = remaining.splice(bestIndex, 1);
    order.push(next);
    cursor = next;
  }

  return order;
}

/**
 * 2-opt: repeatedly reverse a segment when doing so shortens the tour. Removes
 * the self-crossings nearest-neighbour is prone to.
 */
function twoOpt(origin: Point, order: Donation[]): Donation[] {
  if (order.length < 4) return order;

  let best = [...order];
  let bestDistance = tourKm(origin, best);
  let improved = true;
  let guard = 0;

  while (improved && guard < 50) {
    improved = false;
    guard++;

    for (let i = 0; i < best.length - 1; i++) {
      for (let j = i + 1; j < best.length; j++) {
        const candidate = [
          ...best.slice(0, i),
          ...best.slice(i, j + 1).reverse(),
          ...best.slice(j + 1),
        ];
        const distance = tourKm(origin, candidate);
        if (distance < bestDistance - 0.0001) {
          best = candidate;
          bestDistance = distance;
          improved = true;
        }
      }
    }
  }

  return best;
}

/**
 * Builds an optimised collection run.
 *
 * `origin` is where the collector starts — normally the recipient's own
 * address. `departAt` defaults to now; a run planned for later is judged
 * against the deadlines as they will be then.
 */
export function planRoute(
  origin: Point,
  donations: Donation[],
  departAt: Date = new Date(),
): RoutePlan {
  if (donations.length === 0) {
    return { stops: [], total_km: 0, total_minutes: 0, missed: [], saved_km: 0 };
  }

  // Baseline: collect in the order the donations were posted. This is what a
  // coordinator would do without the optimiser, and it is what `saved_km`
  // measures the improvement against.
  const baselineKm = tourKm(origin, donations);

  const optimised = twoOpt(origin, nearestNeighbour(origin, donations));

  const stops: RouteStop[] = [];
  const missed: string[] = [];

  let cursor: Point = origin;
  let elapsed = 0;
  let total_km = 0;

  for (const donation of optimised) {
    const km = legKm(cursor, donation);
    elapsed += travelMinutes(km);
    total_km += km;

    const arrival = new Date(departAt.getTime() + elapsed * 60_000);
    const slack = minutesBetween(arrival, donation.pickup_deadline);

    stops.push({
      donation_id: donation.id,
      label: donation.food_name,
      latitude: donation.latitude,
      longitude: donation.longitude,
      eta_minutes: Math.round(elapsed),
      leg_km: Number(km.toFixed(2)),
      meals: donation.meals,
      deadline: donation.pickup_deadline,
      slack_minutes: slack,
    });

    if (slack < 0) missed.push(donation.id);

    elapsed += SERVICE_TIME_MIN;
    cursor = donation;
  }

  return {
    stops,
    total_km: Number(total_km.toFixed(2)),
    total_minutes: Math.round(elapsed),
    missed,
    saved_km: Number(Math.max(0, baselineKm - total_km).toFixed(2)),
  };
}

/**
 * Reorders a run so the tightest deadlines come first, then reports how much
 * extra driving that urgency costs. Useful when a purely geographic route
 * would miss a deadline: the coordinator can see the trade explicitly.
 */
export function planDeadlineFirstRoute(
  origin: Point,
  donations: Donation[],
  departAt: Date = new Date(),
): RoutePlan {
  const byDeadline = [...donations].sort(
    (a, b) =>
      new Date(a.pickup_deadline).getTime() - new Date(b.pickup_deadline).getTime(),
  );

  const stops: RouteStop[] = [];
  const missed: string[] = [];
  let cursor: Point = origin;
  let elapsed = 0;
  let total_km = 0;

  for (const donation of byDeadline) {
    const km = legKm(cursor, donation);
    elapsed += travelMinutes(km);
    total_km += km;

    const arrival = new Date(departAt.getTime() + elapsed * 60_000);
    const slack = minutesBetween(arrival, donation.pickup_deadline);

    stops.push({
      donation_id: donation.id,
      label: donation.food_name,
      latitude: donation.latitude,
      longitude: donation.longitude,
      eta_minutes: Math.round(elapsed),
      leg_km: Number(km.toFixed(2)),
      meals: donation.meals,
      deadline: donation.pickup_deadline,
      slack_minutes: slack,
    });

    if (slack < 0) missed.push(donation.id);
    elapsed += SERVICE_TIME_MIN;
    cursor = donation;
  }

  return {
    stops,
    total_km: Number(total_km.toFixed(2)),
    total_minutes: Math.round(elapsed),
    missed,
    saved_km: 0,
  };
}

/**
 * Picks whichever ordering actually delivers: the shortest route if it makes
 * every deadline, otherwise the deadline-first one. Distance is only worth
 * optimising once the food is guaranteed to arrive in time.
 */
export function planBestRoute(
  origin: Point,
  donations: Donation[],
  departAt: Date = new Date(),
): { plan: RoutePlan; strategy: "shortest" | "deadline-first"; note: string } {
  const shortest = planRoute(origin, donations, departAt);
  if (shortest.missed.length === 0) {
    return {
      plan: shortest,
      strategy: "shortest",
      note:
        shortest.saved_km > 0
          ? `Shortest route makes every deadline and saves ${shortest.saved_km} km against collecting in posting order.`
          : "Shortest route makes every deadline.",
    };
  }

  const deadlineFirst = planDeadlineFirstRoute(origin, donations, departAt);
  if (deadlineFirst.missed.length < shortest.missed.length) {
    const extra = Number((deadlineFirst.total_km - shortest.total_km).toFixed(2));
    return {
      plan: deadlineFirst,
      strategy: "deadline-first",
      note: `The shortest route would miss ${shortest.missed.length} deadline${
        shortest.missed.length === 1 ? "" : "s"
      }. Driving the tightest deadlines first costs ${extra} km more but saves ${
        shortest.missed.length - deadlineFirst.missed.length
      } more pickup${shortest.missed.length - deadlineFirst.missed.length === 1 ? "" : "s"}.`,
    };
  }

  return {
    plan: shortest,
    strategy: "shortest",
    note: `${shortest.missed.length} pickup${
      shortest.missed.length === 1 ? "" : "s"
    } cannot be reached in time by any ordering — they need a second collector.`,
  };
}

/* -------------------------------------------------------------------------- */
/* Demand hotspots                                                            */
/* -------------------------------------------------------------------------- */

/** Recipients within this radius are treated as one area of demand. */
const CLUSTER_RADIUS_KM = 3;

/**
 * Clusters recipients by proximity and reports unmet capacity per cluster —
 * where demand exists that current supply is not reaching.
 */
export function findDemandHotspots(
  recipients: Organisation[],
  activeDonations: Donation[],
): DemandHotspot[] {
  const verified = recipients.filter((r) => r.verified && r.role === "recipient");
  if (verified.length === 0) return [];

  // Meals already heading to each recipient reduce their unmet demand.
  const incoming = new Map<string, number>();
  for (const donation of activeDonations) {
    if (!donation.matched_recipient_id) continue;
    incoming.set(
      donation.matched_recipient_id,
      (incoming.get(donation.matched_recipient_id) ?? 0) + donation.meals,
    );
  }

  const unassigned = new Set(verified.map((r) => r.id));
  const clusters: Organisation[][] = [];

  for (const seed of verified) {
    if (!unassigned.has(seed.id)) continue;
    unassigned.delete(seed.id);

    const cluster = [seed];
    for (const other of verified) {
      if (!unassigned.has(other.id)) continue;
      const distance = haversineKm(
        seed.latitude,
        seed.longitude,
        other.latitude,
        other.longitude,
      );
      if (distance <= CLUSTER_RADIUS_KM) {
        cluster.push(other);
        unassigned.delete(other.id);
      }
    }
    clusters.push(cluster);
  }

  const hotspots = clusters.map((cluster) => {
    const unmet = cluster.reduce((sum, r) => {
      const need = r.typical_quantity ?? r.capacity_min ?? 0;
      return sum + Math.max(0, need - (incoming.get(r.id) ?? 0));
    }, 0);

    return {
      latitude: average(cluster.map((r) => r.latitude)),
      longitude: average(cluster.map((r) => r.longitude)),
      label:
        cluster.length === 1
          ? cluster[0].name
          : `${localityOf(cluster[0].address)} · ${cluster.length} organisations`,
      unmet_meals: unmet,
      recipients: cluster.length,
      intensity: 0,
    } satisfies DemandHotspot;
  });

  const peak = Math.max(1, ...hotspots.map((h) => h.unmet_meals));
  return hotspots
    .map((h) => ({ ...h, intensity: Number((h.unmet_meals / peak).toFixed(2)) }))
    .sort((a, b) => b.unmet_meals - a.unmet_meals);
}

function average(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function localityOf(address: string): string {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 2] : (parts[0] ?? address);
}
