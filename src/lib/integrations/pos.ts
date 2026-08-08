import type { Organisation } from "@/lib/types";
import { clamp } from "@/lib/utils";

/**
 * Feature #7 — delivery-platform (POS) connector.
 *
 * ---------------------------------------------------------------------------
 * READ THIS BEFORE DEMOING.
 *
 * Zomato and Swiggy do not publish a partner API for order or demand data.
 * There is no key you can obtain that makes this connector return real orders.
 * Everything below therefore runs in SIMULATED mode, and every response is
 * stamped `mode: "simulated"` so the UI can label it plainly. Presenting this
 * as live restaurant data would be a lie, and a judge who asks one question
 * would catch it.
 *
 * What is real is the *shape*: `PosProvider` is the seam a genuine integration
 * plugs into. If a partner agreement ever lands, implement the interface, set
 * POS_PROVIDER=live, and nothing downstream changes.
 * ---------------------------------------------------------------------------
 *
 * What the connector is for: a restaurant's order pattern predicts its
 * surplus. A kitchen that prepped for 400 covers and served 260 has ~140
 * portions spare, and it knows that at 21:30, not at 23:00 when someone
 * finally files a donation. That lead time is the whole value.
 */

export type PosPlatform = "zomato" | "swiggy";

export interface PosOrderWindow {
  /** Start of the hour bucket. */
  hour: number;
  orders: number;
  covers: number;
}

export interface PosSignal {
  platform: PosPlatform;
  organisation_id: string;
  organisation_name: string;
  /** Always "simulated" until a real partner API exists. */
  mode: "simulated" | "live";
  /** Covers the kitchen prepped for today. */
  prepped_covers: number;
  /** Covers actually sold across the day so far. */
  sold_covers: number;
  /** prepped - sold, floored at zero. */
  projected_surplus_covers: number;
  /** Surplus expressed in servable meals. */
  projected_surplus_meals: number;
  /** 0-100 confidence that surplus will actually materialise. */
  confidence: number;
  /** Hour of day the surplus becomes collectable. */
  ready_hour: number;
  hourly: PosOrderWindow[];
  /** Human-readable trend read, e.g. "demand 22% below the weekday norm". */
  trend: string;
  /** True when the shortfall is large enough to be worth alerting on. */
  alert: boolean;
}

/** The seam a real integration would implement. */
export interface PosProvider {
  readonly mode: "simulated" | "live";
  fetchSignal(donor: Organisation, now: Date): Promise<PosSignal | null>;
}

/* -------------------------------------------------------------------------- */
/* Simulated provider                                                         */
/* -------------------------------------------------------------------------- */

/** Deterministic per-organisation, per-day, so a demo does not flicker. */
function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * A typical Indian restaurant's order curve: a lunch peak around 13:00 and a
 * larger dinner peak around 20:30. Surplus follows the dinner service.
 */
function demandCurve(hour: number): number {
  const lunch = Math.exp(-((hour - 13) ** 2) / 4);
  const dinner = Math.exp(-((hour - 20.5) ** 2) / 5) * 1.35;
  return lunch + dinner;
}

/** Platforms this donor type would plausibly be listed on. */
function platformFor(donor: Organisation): PosPlatform | null {
  if (donor.type === "restaurant") return "zomato";
  if (donor.type === "catering" || donor.type === "event") return "swiggy";
  return null;
}

const SIMULATED_PROVIDER: PosProvider = {
  mode: "simulated",

  async fetchSignal(donor, now) {
    const platform = platformFor(donor);
    if (!platform) return null;

    const day = now.toISOString().slice(0, 10);
    const rand = seededRandom(`${donor.id}:${day}`);

    // Kitchens prep to a forecast; the forecast is usually a little optimistic.
    const baseCovers = 180 + Math.round(rand() * 260);
    const prepped_covers = baseCovers;

    // Today's demand as a fraction of the weekday norm.
    const demandFactor = 0.62 + rand() * 0.5;

    const hourly: PosOrderWindow[] = [];
    let sold = 0;
    for (let hour = 11; hour <= 23; hour++) {
      if (hour > now.getHours()) break;
      const share = demandCurve(hour) / 6.2;
      const covers = Math.round(baseCovers * share * demandFactor);
      const orders = Math.round(covers / (1.8 + rand() * 0.6));
      sold += covers;
      hourly.push({ hour, orders, covers });
    }

    const sold_covers = Math.min(prepped_covers, sold);
    const projected_surplus_covers = Math.max(0, prepped_covers - sold_covers);
    // Not every unsold cover survives as servable food.
    const projected_surplus_meals = Math.round(projected_surplus_covers * 0.72);

    // Confidence rises with how much of the service has already happened.
    const serviceProgress = clamp((now.getHours() - 11) / 11, 0, 1);
    const confidence = clamp(
      Math.round((0.45 + 0.5 * serviceProgress) * 100 - (demandFactor > 1 ? 15 : 0)),
      10,
      95,
    );

    const deviation = Math.round((demandFactor - 1) * 100);
    const trend =
      deviation <= -8
        ? `Demand ${Math.abs(deviation)}% below the weekday norm — surplus likely`
        : deviation >= 8
          ? `Demand ${deviation}% above the weekday norm — little surplus expected`
          : "Demand tracking close to the weekday norm";

    return {
      platform,
      organisation_id: donor.id,
      organisation_name: donor.name,
      mode: "simulated",
      prepped_covers,
      sold_covers,
      projected_surplus_covers,
      projected_surplus_meals,
      confidence,
      ready_hour: 22,
      hourly,
      trend,
      alert: projected_surplus_meals >= 25 && confidence >= 50,
    };
  },
};

/* -------------------------------------------------------------------------- */

/**
 * Returns the configured provider.
 *
 * `POS_PROVIDER=live` is accepted but deliberately unimplemented — it throws
 * rather than silently falling back to fabricated numbers, because a caller
 * asking for live data must never be handed simulated data unlabelled.
 */
export function getPosProvider(): PosProvider {
  if (process.env.POS_PROVIDER === "live") {
    throw new Error(
      "POS_PROVIDER=live is not implemented: no partner API is available for " +
        "Zomato or Swiggy order data. Remove the variable to use the clearly " +
        "labelled simulated connector.",
    );
  }
  return SIMULATED_PROVIDER;
}

export function isPosSimulated(): boolean {
  return getPosProvider().mode === "simulated";
}

/** Fetches signals for every donor that would plausibly be on a platform. */
export async function fetchPosSignals(
  donors: Organisation[],
  now: Date = new Date(),
): Promise<PosSignal[]> {
  const provider = getPosProvider();
  const signals = await Promise.all(
    donors.map((donor) => provider.fetchSignal(donor, now)),
  );
  return signals
    .filter((s): s is PosSignal => s !== null)
    .sort((a, b) => b.projected_surplus_meals - a.projected_surplus_meals);
}

/** The subset worth interrupting a coordinator for. */
export function posAlerts(signals: PosSignal[]): PosSignal[] {
  return signals.filter((s) => s.alert);
}
