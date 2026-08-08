import {
  PICKUP_LOGISTICS_FLOOR_MIN,
  SHELF_LIFE_MINUTES,
  TERMINAL_STATUSES,
  riskLevelFor,
} from "@/lib/constants";
import type { Donation, RiskLevel } from "@/lib/types";
import { clamp, formatDuration, minutesBetween } from "@/lib/utils";

/**
 * AI feature #1 — surplus/waste-risk prediction.
 *
 * The score is a weighted blend of five independent pressures plus a
 * compounding term, because the failure mode this platform exists to prevent
 * is not any single pressure but their coincidence: highly perishable food,
 * unclaimed, with the window closing.
 */

export const RISK_WEIGHTS = {
  time: 0.44,
  freshness: 0.16,
  volume: 0.12,
  claim: 0.18,
  reach: 0.1,
  /** Ceiling of the super-additive term layered on top of the weighted sum. */
  compound: 0.18,
} as const;

/** Horizon beyond which extra lead time stops reducing urgency. */
const URGENCY_HORIZON_MIN = 300;
/** Quantity at which volume risk saturates. */
const VOLUME_SATURATION_MEALS = 120;
/** Shelf life at or below which a food counts as highly perishable. */
const PERISHABLE_SHELF_MIN = 480;

export interface RiskFactor {
  key: "time" | "freshness" | "volume" | "claim" | "reach";
  label: string;
  /** Normalised 0–1 pressure. */
  value: number;
  /** Points this factor contributed to the final 0–100 score. */
  points: number;
  detail: string;
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  reasons: string[];
  /** Minutes left before the pickup deadline, negative if already past. */
  minutes_remaining: number;
  /** Minutes left before the food is no longer safe to serve. */
  freshness_remaining: number;
  viable_recipients: number;
}

/**
 * How much of the donation's remaining time is actually usable. Time below the
 * logistics floor cannot be spent collecting food, so it counts as zero.
 */
export function urgencyPressure(minutesRemaining: number): number {
  const usable = minutesRemaining - PICKUP_LOGISTICS_FLOOR_MIN;
  return clamp(1 - usable / URGENCY_HORIZON_MIN, 0, 1);
}

export function volumePressure(meals: number): number {
  return Math.sqrt(clamp(meals / VOLUME_SATURATION_MEALS, 0, 1));
}

/** How much of the food's safe holding time has already been consumed. */
export function freshnessPressure(
  preparedAt: string,
  foodType: Donation["food_type"],
  now: Date,
): number {
  const shelf = SHELF_LIFE_MINUTES[foodType];
  const elapsed = minutesBetween(preparedAt, now);
  return clamp(elapsed / shelf, 0, 1) ** 0.6;
}

/** Risk carried by the donation still being unspoken for. */
export function claimPressure(status: Donation["status"]): number {
  switch (status) {
    case "available":
      return 1;
    case "matched":
      return 0.45;
    case "pickup_scheduled":
      return 0.15;
    case "picked_up":
      return 0.02;
    default:
      return 0;
  }
}

/** Thin markets are risky: one viable recipient is one point of failure. */
export function reachPressure(viableRecipients: number): number {
  return Math.exp(-viableRecipients / 2);
}

export function assessWasteRisk(
  donation: Pick<
    Donation,
    | "meals"
    | "status"
    | "pickup_deadline"
    | "prepared_at"
    | "food_type"
    | "dietary_type"
  >,
  viableRecipients: number,
  now: Date = new Date(),
): RiskAssessment {
  const minutes_remaining = minutesBetween(now, donation.pickup_deadline);
  const shelf = SHELF_LIFE_MINUTES[donation.food_type];
  const freshness_remaining =
    minutesBetween(now, donation.prepared_at) + shelf;

  // A settled donation carries no waste risk. Without this, a donation
  // delivered last month keeps accruing "time pressure" forever and reports
  // itself as high risk, which is both wrong and alarming on a dashboard.
  if (TERMINAL_STATUSES.includes(donation.status)) {
    return {
      score: 0,
      level: "LOW",
      factors: [],
      reasons: [
        donation.status === "delivered"
          ? `Delivered — ${donation.meals} meals were rescued`
          : "Cancelled — this donation was withdrawn",
      ],
      minutes_remaining,
      freshness_remaining,
      viable_recipients: viableRecipients,
    };
  }

  const time = urgencyPressure(minutes_remaining);
  const freshness = freshnessPressure(donation.prepared_at, donation.food_type, now);
  const volume = volumePressure(donation.meals);
  const claim = claimPressure(donation.status);
  const reach = reachPressure(viableRecipients);

  const perishable = shelf <= PERISHABLE_SHELF_MIN ? 1 : 0.5;
  const compound = RISK_WEIGHTS.compound * time * claim * perishable;

  const raw =
    RISK_WEIGHTS.time * time +
    RISK_WEIGHTS.freshness * freshness +
    RISK_WEIGHTS.volume * volume +
    RISK_WEIGHTS.claim * claim +
    RISK_WEIGHTS.reach * reach +
    compound;

  const score = clamp(Math.round(raw * 100), 0, 100);

  const factors: RiskFactor[] = [
    {
      key: "time",
      label: "Time pressure",
      value: time,
      points: Math.round(RISK_WEIGHTS.time * time * 100),
      detail:
        minutes_remaining < 0
          ? `Pickup deadline passed ${formatDuration(minutes_remaining).replace("overdue by ", "")} ago`
          : `${formatDuration(minutes_remaining)} left before the pickup deadline`,
    },
    {
      key: "freshness",
      label: "Freshness decay",
      value: freshness,
      points: Math.round(RISK_WEIGHTS.freshness * freshness * 100),
      detail:
        freshness_remaining < 0
          ? "Past its safe holding time"
          : `${formatDuration(freshness_remaining)} of safe holding time left`,
    },
    {
      key: "volume",
      label: "Quantity at stake",
      value: volume,
      points: Math.round(RISK_WEIGHTS.volume * volume * 100),
      detail: `${donation.meals} meals would be lost`,
    },
    {
      key: "claim",
      label: "Claim status",
      value: claim,
      points: Math.round(RISK_WEIGHTS.claim * claim * 100),
      detail:
        donation.status === "available"
          ? "No recipient has confirmed pickup yet"
          : `Donation is ${donation.status.replace("_", " ")}`,
    },
    {
      key: "reach",
      label: "Recipient reach",
      value: reach,
      points: Math.round(RISK_WEIGHTS.reach * reach * 100),
      detail:
        viableRecipients === 0
          ? "No verified recipient can currently take this"
          : `${viableRecipients} verified recipient${viableRecipients === 1 ? "" : "s"} can take this`,
    },
  ];

  return {
    score,
    level: riskLevelFor(score),
    factors,
    reasons: topRiskReasons(factors, donation.meals),
    minutes_remaining,
    freshness_remaining,
    viable_recipients: viableRecipients,
  };
}

/** The three factors carrying the most weight, phrased for a human. */
function topRiskReasons(factors: RiskFactor[], meals: number): string[] {
  const ranked = [...factors].sort((a, b) => b.points - a.points);
  return ranked
    .filter((f) => f.points > 2)
    .slice(0, 4)
    .map((f) => {
      switch (f.key) {
        case "time":
          return f.detail.startsWith("Pickup deadline passed")
            ? f.detail
            : `Pickup window is closing — ${f.detail}`;
        case "freshness":
          return `Food is losing freshness — ${f.detail.toLowerCase()}`;
        case "volume":
          return `Large quantity at stake — ${meals} meals`;
        case "claim":
          return f.detail;
        case "reach":
          return f.detail;
      }
    });
}
