import { PICKUP_LOGISTICS_FLOOR_MIN, priorityLevelFor } from "@/lib/constants";
import type { Donation, PriorityLevel } from "@/lib/types";
import { clamp, formatDuration } from "@/lib/utils";

import { claimPressure, urgencyPressure, volumePressure } from "./risk";

/**
 * AI feature #3 — pickup priority.
 *
 * Waste risk answers "will this be lost?". Priority answers "what should the
 * coordinator touch first?", which is a different question: a donation can be
 * risky but already handled, or low-risk but about to fall through the cracks.
 * Priority therefore leans on risk but re-weights around actionability.
 */

export const PRIORITY_WEIGHTS = {
  risk: 0.55,
  urgency: 0.22,
  volume: 0.1,
  unclaimed: 0.13,
  /** Ceiling of the escalation applied to unclaimed food near its deadline. */
  escalation: 0.14,
} as const;

/** Window inside which an unclaimed donation starts escalating hard. */
const ESCALATION_WINDOW_MIN = 180;

export interface PriorityAssessment {
  score: number;
  level: PriorityLevel;
  reason: string;
  minutes_remaining: number;
}

export function assessPriority(
  donation: Pick<Donation, "meals" | "status" | "pickup_deadline">,
  wasteRiskScore: number,
  minutesRemaining: number,
  bestMatchScore: number | null,
): PriorityAssessment {
  // Settled donations need no coordinator attention at all.
  if (donation.status === "delivered" || donation.status === "cancelled") {
    return {
      score: 0,
      level: "LOW",
      reason:
        donation.status === "delivered"
          ? "Delivered — no further action needed."
          : "Cancelled — no further action needed.",
      minutes_remaining: minutesRemaining,
    };
  }

  const risk = wasteRiskScore / 100;
  const urgency = urgencyPressure(minutesRemaining);
  const volume = volumePressure(donation.meals);
  const unclaimed = claimPressure(donation.status);

  const usable = minutesRemaining - PICKUP_LOGISTICS_FLOOR_MIN;
  const escalation =
    PRIORITY_WEIGHTS.escalation *
    unclaimed *
    clamp(1 - usable / ESCALATION_WINDOW_MIN, 0, 1);

  const raw =
    PRIORITY_WEIGHTS.risk * risk +
    PRIORITY_WEIGHTS.urgency * urgency +
    PRIORITY_WEIGHTS.volume * volume +
    PRIORITY_WEIGHTS.unclaimed * unclaimed +
    escalation;

  const score = clamp(Math.round(raw * 100), 0, 100);

  return {
    score,
    level: priorityLevelFor(score),
    reason: priorityReason(donation, score, minutesRemaining, bestMatchScore),
    minutes_remaining: minutesRemaining,
  };
}

function priorityReason(
  donation: Pick<Donation, "meals" | "status">,
  score: number,
  minutesRemaining: number,
  bestMatchScore: number | null,
): string {
  const level = priorityLevelFor(score);
  const time =
    minutesRemaining < 0
      ? "The pickup deadline has already passed"
      : `Only ${formatDuration(minutesRemaining)} remain before the pickup deadline`;

  if (donation.status === "available") {
    const matchNote =
      bestMatchScore !== null
        ? ` A ${bestMatchScore}% match is available and can be confirmed immediately.`
        : " No verified recipient can currently take it, so the quantity or window may need to change.";

    if (level === "CRITICAL" || level === "HIGH") {
      return `${time}, and ${donation.meals} meals are still unclaimed. This donation should be handled immediately.${matchNote}`;
    }
    return `${time}. ${donation.meals} meals are unclaimed but there is still room to arrange a pickup.${matchNote}`;
  }

  if (donation.status === "matched") {
    return `${time}. A recipient has accepted, so the next step is confirming a pickup time before the window closes.`;
  }

  if (donation.status === "pickup_scheduled") {
    return `${time}. Pickup is scheduled — this needs monitoring rather than intervention.`;
  }

  return `Food has been collected and is awaiting confirmation of delivery. ${donation.meals} meals are already out of the waste stream.`;
}
