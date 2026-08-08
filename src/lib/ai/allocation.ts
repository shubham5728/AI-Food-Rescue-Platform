import { MIN_ALLOCATION_SLICE_MEALS } from "@/lib/constants";
import type { AllocationPlan, AllocationSlice, Donation } from "@/lib/types";
import { formatDistance } from "@/lib/geo";

import type { CandidateContext } from "./constraints";
import { quantityFit, scoreCandidate } from "./match";

/**
 * AI feature #6 — smart food allocation.
 *
 * The matching engine answers "who is the single best home for this?". That
 * breaks down on a 400-meal wedding surplus, where no one recipient can take
 * the lot and the honest answer is "split it". This module decides how.
 *
 * The split is greedy over match quality, but bounded by two rules that matter
 * in practice:
 *
 *  - never leave a recipient with a token amount that isn't worth their trip;
 *  - never hand a recipient more than they said they can absorb.
 *
 * The hard constraints have already run, so every candidate here can take
 * *some* of the food; the only question is how much.
 */

/** A slice smaller than this wastes the collection run it requires. */
const MIN_VIABLE_SLICE = MIN_ALLOCATION_SLICE_MEALS;

/**
 * How far above a recipient's typical intake we are willing to push before
 * preferring to spread the food further. Capacity is the hard ceiling; this is
 * the comfort ceiling.
 */
const STRETCH_FACTOR = 1.25;

/**
 * Always a whole number: you cannot deliver a quarter of a meal, and a plan
 * that reports "356.25 meals allocated" is not a plan anyone can act on.
 */
function comfortableCeiling(candidate: CandidateContext): number {
  const r = candidate.recipient;
  const capacity = r.capacity_max ?? 0;
  const typical = r.typical_quantity ?? capacity;
  return Math.floor(
    Math.min(capacity, Math.max(typical * STRETCH_FACTOR, r.capacity_min ?? 0)),
  );
}

/**
 * Builds the allocation plan for a donation across its viable recipients.
 *
 * Returns a single-recipient plan when one organisation can comfortably take
 * everything — splitting food that does not need splitting just creates two
 * pickups where one would do.
 */
export function planAllocation(
  donation: Donation,
  candidates: CandidateContext[],
): AllocationPlan {
  const ranked = candidates
    .map((candidate) => ({ candidate, scored: scoreCandidate(donation, candidate) }))
    .sort((a, b) => b.scored.score - a.scored.score);

  if (ranked.length === 0) {
    return {
      donation_id: donation.id,
      total_meals: donation.meals,
      allocated_meals: 0,
      leftover_meals: donation.meals,
      slices: [],
      explanation:
        "No verified recipient clears every hard constraint for this donation, so there is nothing to allocate. Extending the pickup deadline or relaxing the allergen list would open up options.",
      single_recipient: false,
    };
  }

  const best = ranked[0];

  // One recipient can take it comfortably — no split needed.
  if (comfortableCeiling(best.candidate) >= donation.meals) {
    return {
      donation_id: donation.id,
      total_meals: donation.meals,
      allocated_meals: donation.meals,
      leftover_meals: 0,
      slices: [sliceFor(best.candidate, best.scored.score, donation.meals, donation)],
      explanation: `${best.candidate.recipient.name} can absorb all ${donation.meals} meals on its own, so the donation stays as a single pickup.`,
      single_recipient: true,
    };
  }

  /* -- Greedy split over match quality ------------------------------------ */
  const slices: AllocationSlice[] = [];
  let remaining = donation.meals;

  for (const { candidate, scored } of ranked) {
    if (remaining <= 0) break;

    const ceiling = comfortableCeiling(candidate);
    let take = Math.min(ceiling, remaining);

    // Don't strand a remainder too small for anyone else to bother collecting.
    const wouldStrand = remaining - take > 0 && remaining - take < MIN_VIABLE_SLICE;
    if (wouldStrand) {
      const hardCeiling = candidate.recipient.capacity_max ?? ceiling;
      take = Math.min(hardCeiling, remaining);
    }

    if (take < MIN_VIABLE_SLICE && remaining >= MIN_VIABLE_SLICE) continue;
    if (take <= 0) continue;

    slices.push(sliceFor(candidate, scored.score, take, donation));
    remaining -= take;
  }

  const allocated = slices.reduce((sum, s) => sum + s.meals, 0);

  return {
    donation_id: donation.id,
    total_meals: donation.meals,
    allocated_meals: allocated,
    leftover_meals: Math.max(0, donation.meals - allocated),
    slices,
    explanation: explain(donation, slices, donation.meals - allocated),
    single_recipient: slices.length === 1,
  };
}

function sliceFor(
  candidate: CandidateContext,
  score: number,
  meals: number,
  donation: Donation,
): AllocationSlice {
  const r = candidate.recipient;
  const typical = r.typical_quantity ?? r.capacity_max ?? meals;
  const fit = quantityFit(meals, typical);

  const reason =
    fit > 0.85
      ? `${meals} meals matches its usual intake of about ${typical}`
      : meals >= (r.capacity_max ?? 0)
        ? `Filled to its ${r.capacity_max}-meal capacity`
        : `${meals} meals fits inside its ${r.capacity_max}-meal capacity`;

  return {
    recipient_id: r.id,
    recipient_name: r.name,
    meals,
    match_score: score,
    distance_km: candidate.distance_km,
    reason: `${reason}, ${formatDistance(candidate.distance_km)} from ${donation.address.split(",")[0]}`,
  };
}

function explain(
  donation: Donation,
  slices: AllocationSlice[],
  leftover: number,
): string {
  if (slices.length === 0) {
    return `None of the viable recipients can take a useful share of ${donation.meals} meals.`;
  }

  const breakdown = slices
    .map((s) => `${s.recipient_name} (${s.meals})`)
    .join(", ");

  const head = `${donation.meals} meals exceed what any single recipient can absorb, so the AI splits the donation across ${slices.length} organisations: ${breakdown}.`;

  if (leftover > 0) {
    return `${head} ${leftover} meals remain unallocated — no remaining recipient can take a share worth collecting, so extending the deadline would help.`;
  }

  return `${head} Every meal is accounted for, and each share is large enough to justify the collection trip.`;
}
