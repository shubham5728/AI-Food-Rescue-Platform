import { DIETARY_LABELS, FOOD_CATEGORY_LABELS } from "@/lib/constants";
import { formatDistance } from "@/lib/geo";
import type { Donation, Organisation } from "@/lib/types";
import { clamp, formatDuration } from "@/lib/utils";

import type { CandidateContext } from "./constraints";

/**
 * AI feature #2 — recipient matching (step 2 of the architecture).
 *
 * Everything scored here has already cleared the hard constraints, so the job
 * is no longer "can they take it" but "how good a home is this". Scores are
 * mapped onto a 30–100 band: a candidate that survived filtering is by
 * definition a workable option, and showing it as "12% match" would be a lie.
 */

export const MATCH_WEIGHTS = {
  quantity: 0.24,
  distance: 0.22,
  time: 0.18,
  dietary: 0.14,
  food_type: 0.12,
  capability: 0.1,
} as const;

/** Floor of the displayed score band — the value of merely being viable. */
export const MATCH_FLOOR = 30;
const MATCH_SPAN = 100 - MATCH_FLOOR;

/** Distance at which an urban pickup stops feeling local. */
const CITY_SCALE_KM = 10;
/** Time buffer beyond which extra slack no longer improves the match. */
const COMFORTABLE_BUFFER_MIN = 75;
/** Lead time at which a collector counts as slow to mobilise. */
const SLOW_LEAD_MIN = 120;

export interface MatchFactor {
  key: keyof typeof MATCH_WEIGHTS;
  label: string;
  value: number;
  points: number;
  detail: string;
}

export interface ScoredMatch {
  recipient: Organisation;
  score: number;
  factors: MatchFactor[];
  reasons: string[];
  distance_km: number;
  travel_min: number;
  time_buffer_min: number;
  earliest_arrival: string;
}

/**
 * Log-normal fit around the recipient's typical intake. Both halves matter:
 * far too little food wastes a collection run, far too much strains them.
 */
export function quantityFit(meals: number, typical: number): number {
  if (typical <= 0) return 0.5;
  const ratio = meals / typical;
  const sigma = 0.55;
  return Math.exp(-(Math.log(ratio) ** 2) / (2 * sigma ** 2));
}

/**
 * Blends absolute closeness with how much of the recipient's stated range the
 * trip consumes — 4 km is genuinely near, but it means more to an
 * organisation with a 20 km reach than to one with a 5 km reach.
 */
export function distanceFit(distanceKm: number, radiusKm: number): number {
  const absolute = clamp(1 - distanceKm / CITY_SCALE_KM, 0, 1) ** 0.7;
  const relative = radiusKm > 0 ? clamp(1 - (distanceKm / radiusKm) ** 2, 0, 1) : 0;
  return 0.7 * absolute + 0.3 * relative;
}

/** Being able to make it at all is most of the value; slack is the rest. */
export function timeFit(bufferMin: number): number {
  return 0.55 + 0.45 * clamp(bufferMin / COMFORTABLE_BUFFER_MIN, 0, 1);
}

export function dietaryFit(
  food: Donation["dietary_type"],
  accepts: Organisation["dietary_requirements"],
): number {
  const direct = accepts.includes(food);
  if (direct && accepts.length === 1) return 1;
  if (direct) return 0.85;
  // Reached only via the strictness hierarchy (e.g. vegan food, vegetarian org).
  return 0.9;
}

/** Position in the accepted list is treated as a preference ordering. */
export function foodTypeFit(
  type: Donation["food_type"],
  accepted: Organisation["accepted_food_types"],
): number {
  if (!accepted || accepted.length === 0) return 0.85;
  const index = accepted.indexOf(type);
  if (index === -1) return 0.6;
  return clamp(1 - index * 0.08, 0.7, 1);
}

export function capabilityFit(recipient: Organisation): number {
  const lead = recipient.pickup_lead_time_min ?? 60;
  const leadQuality = clamp(1 - lead / SLOW_LEAD_MIN, 0, 1);
  const pickupQuality = recipient.can_pickup ? 1 : 0.55;
  return 0.4 * leadQuality + 0.35 * recipient.reliability + 0.25 * pickupQuality;
}

export function scoreCandidate(
  donation: Donation,
  candidate: CandidateContext,
): ScoredMatch {
  const { recipient } = candidate;
  const typical = recipient.typical_quantity ?? recipient.capacity_max ?? donation.meals;

  const values = {
    quantity: quantityFit(donation.meals, typical),
    distance: distanceFit(candidate.distance_km, recipient.pickup_radius_km ?? 0),
    time: timeFit(candidate.time_buffer_min),
    dietary: dietaryFit(donation.dietary_type, recipient.dietary_requirements),
    food_type: foodTypeFit(donation.food_type, recipient.accepted_food_types),
    capability: capabilityFit(recipient),
  } satisfies Record<keyof typeof MATCH_WEIGHTS, number>;

  const quality = (
    Object.keys(MATCH_WEIGHTS) as (keyof typeof MATCH_WEIGHTS)[]
  ).reduce((sum, key) => sum + MATCH_WEIGHTS[key] * values[key], 0);

  const score = clamp(Math.round(MATCH_FLOOR + MATCH_SPAN * quality), 0, 100);

  const factors: MatchFactor[] = [
    {
      key: "quantity",
      label: "Quantity fit",
      value: values.quantity,
      points: Math.round(MATCH_WEIGHTS.quantity * values.quantity * MATCH_SPAN),
      detail: `Typically takes ~${typical} meals, capacity ${recipient.capacity_max}`,
    },
    {
      key: "distance",
      label: "Distance",
      value: values.distance,
      points: Math.round(MATCH_WEIGHTS.distance * values.distance * MATCH_SPAN),
      detail: `${formatDistance(candidate.distance_km)} away, ~${candidate.travel_min} min drive`,
    },
    {
      key: "time",
      label: "Pickup feasibility",
      value: values.time,
      points: Math.round(MATCH_WEIGHTS.time * values.time * MATCH_SPAN),
      detail: `Can collect with ${formatDuration(candidate.time_buffer_min)} to spare`,
    },
    {
      key: "dietary",
      label: "Dietary match",
      value: values.dietary,
      points: Math.round(MATCH_WEIGHTS.dietary * values.dietary * MATCH_SPAN),
      detail: `Accepts ${recipient.dietary_requirements
        .map((d) => DIETARY_LABELS[d].toLowerCase())
        .join(", ")}`,
    },
    {
      key: "food_type",
      label: "Food type",
      value: values.food_type,
      points: Math.round(MATCH_WEIGHTS.food_type * values.food_type * MATCH_SPAN),
      detail:
        recipient.accepted_food_types.length > 0
          ? `Accepts ${FOOD_CATEGORY_LABELS[donation.food_type].toLowerCase()}`
          : "No stated food-type restriction",
    },
    {
      key: "capability",
      label: "Collection capability",
      value: values.capability,
      points: Math.round(MATCH_WEIGHTS.capability * values.capability * MATCH_SPAN),
      detail: `${recipient.can_pickup ? "Self-collects" : "Needs delivery"}, ${
        recipient.pickup_lead_time_min
      } min notice, ${Math.round(recipient.reliability * 100)}% completion rate`,
    },
  ];

  return {
    recipient,
    score,
    factors,
    reasons: matchReasons(donation, candidate, values),
    distance_km: Number(candidate.distance_km.toFixed(2)),
    travel_min: candidate.travel_min,
    time_buffer_min: candidate.time_buffer_min,
    earliest_arrival: candidate.earliest_arrival.toISOString(),
  };
}

/** The checklist bullets rendered beside the score on the match card. */
function matchReasons(
  donation: Donation,
  candidate: CandidateContext,
  values: Record<keyof typeof MATCH_WEIGHTS, number>,
): string[] {
  const { recipient } = candidate;
  const reasons: string[] = [];

  reasons.push(
    `${DIETARY_LABELS[donation.dietary_type]} food accepted`,
  );

  const typical = recipient.typical_quantity ?? recipient.capacity_max ?? 0;
  reasons.push(
    values.quantity > 0.8
      ? `Needs approximately ${typical} meals — donation is ${donation.meals}`
      : `Can absorb ${donation.meals} meals within a ${recipient.capacity_max}-meal capacity`,
  );

  // "Only 17.7 km away" reads as spin; reserve the word for genuinely close.
  reasons.push(
    candidate.distance_km <= 5
      ? `Only ${formatDistance(candidate.distance_km)} away`
      : `${formatDistance(candidate.distance_km)} away`,
  );

  reasons.push(
    recipient.can_pickup
      ? `Can collect within ${(recipient.pickup_lead_time_min ?? 0) + candidate.travel_min} minutes`
      : `Requires delivery, ~${candidate.travel_min} min drive`,
  );

  if (recipient.verified) reasons.push("Verified organisation");

  return reasons;
}

/**
 * Full ranking pass. Ties are broken by distance so the shorter trip wins,
 * which also keeps the ordering stable between renders.
 */
export function rankCandidates(
  donation: Donation,
  candidates: CandidateContext[],
): ScoredMatch[] {
  return candidates
    .map((c) => scoreCandidate(donation, c))
    .sort((a, b) => b.score - a.score || a.distance_km - b.distance_km);
}
