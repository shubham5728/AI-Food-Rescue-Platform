import {
  DIETARY_LABELS,
  FOOD_CATEGORY_LABELS,
  ORGANISATION_TYPE_LABELS,
} from "@/lib/constants";
import { formatDistance } from "@/lib/geo";
import type { Donation } from "@/lib/types";
import { formatDuration, formatTime } from "@/lib/utils";

import type { ScoredMatch } from "./match";
import type { RiskAssessment } from "./risk";

/**
 * Deterministic explanation writer.
 *
 * Every AI decision in the product must carry a human-readable "why". When an
 * OpenAI key is configured the LLM writes this prose; when it isn't, these
 * functions produce the same shape from the same factor breakdown, so the
 * product never degrades into bare percentages.
 */

/** "NGO" must survive the lowercasing that reads naturally for "restaurant". */
const ACRONYM_ORG_TYPES = new Set<string>(["ngo"]);

function orgTypeNoun(type: keyof typeof ORGANISATION_TYPE_LABELS): string {
  const label = ORGANISATION_TYPE_LABELS[type];
  return ACRONYM_ORG_TYPES.has(type) ? label : label.toLowerCase();
}

/** "an 84% record" but "a 97% record" — the article follows how it is read. */
function numericArticle(value: number): string {
  const first = String(value);
  return first.startsWith("8") || first === "11" || first === "18" ? "an" : "a";
}

export function narrateWasteRisk(
  donation: Donation,
  risk: RiskAssessment,
): string {
  const food = `${donation.meals} ${DIETARY_LABELS[donation.dietary_type].toLowerCase()} meals`;
  const window =
    risk.minutes_remaining < 0
      ? "the pickup window has already closed"
      : `${formatDuration(risk.minutes_remaining)} remain before the ${formatTime(
          donation.pickup_deadline,
        )} pickup deadline`;

  const claim =
    donation.status === "available"
      ? "no recipient has confirmed collection"
      : `the donation is ${donation.status.replace("_", " ")}`;

  const freshness =
    risk.freshness_remaining < 0
      ? "The food is already past its safe holding time."
      : `${FOOD_CATEGORY_LABELS[donation.food_type]} of this kind keep about ${formatDuration(
          risk.freshness_remaining,
        )} of safe holding time from now.`;

  const reach =
    risk.viable_recipients === 0
      ? "No verified recipient currently clears the distance, capacity and dietary constraints, which is the single largest driver of this score."
      : `${risk.viable_recipients} verified recipient${
          risk.viable_recipients === 1 ? "" : "s"
        } can still take it, which holds the score below what it would otherwise be.`;

  const verdict =
    risk.level === "HIGH"
      ? "Without action in the next few minutes this food is likely to be wasted."
      : risk.level === "MEDIUM"
        ? "There is still workable time, but this should not be left unattended."
        : "This donation is comfortably within its window.";

  return `${food} are on offer and ${window}, while ${claim}. ${freshness} ${reach} ${verdict}`;
}

export function narrateMatch(
  donation: Donation,
  match: ScoredMatch,
  isTop: boolean,
): string {
  const r = match.recipient;
  const typical = r.typical_quantity ?? r.capacity_max ?? donation.meals;
  const lead = (r.pickup_lead_time_min ?? 0) + match.travel_min;

  const opener = isTop
    ? `${r.name} is the strongest match`
    : `${r.name} is a workable alternative`;

  const quantityValue = match.factors.find((f) => f.key === "quantity")!.value;
  const quantityClause =
    quantityValue > 0.92
      ? `it normally takes around ${typical} meals, so ${donation.meals} lands squarely in its range`
      : quantityValue > 0.7
        ? `it normally takes around ${typical} meals, so ${donation.meals} is comfortably within reach`
        : `${donation.meals} meals sit inside its ${r.capacity_max}-meal capacity`;

  const dietClause = `it accepts ${DIETARY_LABELS[donation.dietary_type].toLowerCase()} food`;

  const distanceClause =
    match.distance_km <= 5
      ? `it is only ${formatDistance(match.distance_km)} away`
      : `it is ${formatDistance(match.distance_km)} away`;

  const timeClause = r.can_pickup
    ? `it can have a collection on site in about ${lead} minutes, leaving ${formatDuration(
        match.time_buffer_min,
      )} of slack before the deadline`
    : `a delivery run of about ${match.travel_min} minutes still lands ${formatDuration(
        match.time_buffer_min,
      )} inside the deadline`;

  const reliability = Math.round(r.reliability * 100);
  const trust = r.verified
    ? ` It is a verified ${orgTypeNoun(r.type)} with ${numericArticle(
        reliability,
      )} ${reliability}% pickup completion record.`
    : "";

  return `${opener} because ${dietClause}, ${quantityClause}, ${distanceClause}, and ${timeClause}.${trust}`;
}

/** One-line summary of the whole matching pass, shown above the match list. */
export function narrateMatchSummary(
  matches: ScoredMatch[],
  rejectedCount: number,
): string {
  if (matches.length === 0) {
    return `No verified recipient currently satisfies every hard constraint for this donation — ${rejectedCount} organisation${
      rejectedCount === 1 ? " was" : "s were"
    } ruled out on capacity, diet, distance or timing. Extending the pickup deadline or splitting the quantity would open up options.`;
  }

  const best = matches[0];
  return `${rejectedCount} organisation${
    rejectedCount === 1 ? " was" : "s were"
  } ruled out by hard constraints, leaving ${matches.length} viable recipient${
    matches.length === 1 ? "" : "s"
  }. ${best.recipient.name} ranks first at ${best.score}% on quantity fit, distance and pickup feasibility.`;
}
