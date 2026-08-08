import { SHELF_LIFE_MINUTES } from "@/lib/constants";
import type { Donation, Organisation, SurplusForecast } from "@/lib/types";
import { clamp } from "@/lib/utils";

import { urgencyPressure, volumePressure } from "./risk";

/**
 * AI feature #1 — surplus prediction.
 *
 * Waste risk answers "is this donation in trouble?". This answers the question
 * that comes *before* a donation exists: "which kitchens are about to have food
 * spare, roughly how much, and when?" — so recipients can be lined up in
 * advance instead of scrambling once the clock is already running.
 *
 * It is a frequency-and-recency model over the donor's own history. No global
 * training, no black box: every number below can be traced to that donor's past
 * donations, which is what makes the forecast explainable and what keeps it
 * honest when a donor has posted only twice.
 */

/** Donations older than this contribute nothing to the forecast. */
const HISTORY_WINDOW_DAYS = 90;
/** Half-life of a donation's influence, in days — recent behaviour dominates. */
const RECENCY_HALF_LIFE_DAYS = 21;
/** Below this many past donations the forecast is labelled low confidence. */
const MIN_SAMPLE_FOR_MEDIUM = 4;
const MIN_SAMPLE_FOR_HIGH = 10;

const DAY_MS = 86_400_000;

interface HistoryPoint {
  at: Date;
  meals: number;
  /** Minutes past midnight the food was ready. */
  minuteOfDay: number;
  weight: number;
}

/** Exponential recency decay, so last week counts for more than last month. */
function recencyWeight(ageDays: number): number {
  return Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS);
}

function weightedMean(values: number[], weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  return values.reduce((sum, v, i) => sum + v * weights[i], 0) / total;
}

function weightedStdDev(values: number[], weights: number[], mean: number): number {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  const variance =
    values.reduce((sum, v, i) => sum + weights[i] * (v - mean) ** 2, 0) / total;
  return Math.sqrt(variance);
}

/**
 * Circular mean of times of day. A plain average would put 23:30 and 00:30 at
 * noon, which is exactly wrong for a restaurant's late service.
 */
function circularMeanMinutes(minutes: number[], weights: number[]): number {
  if (minutes.length === 0) return 0;
  let x = 0;
  let y = 0;
  minutes.forEach((m, i) => {
    const angle = (m / 1440) * 2 * Math.PI;
    x += Math.cos(angle) * weights[i];
    y += Math.sin(angle) * weights[i];
  });
  if (x === 0 && y === 0) return minutes[0];
  let angle = Math.atan2(y, x);
  if (angle < 0) angle += 2 * Math.PI;
  return (angle / (2 * Math.PI)) * 1440;
}

function collectHistory(donations: Donation[], now: Date): HistoryPoint[] {
  const cutoff = now.getTime() - HISTORY_WINDOW_DAYS * DAY_MS;

  return donations
    .filter((d) => d.status !== "cancelled")
    .map((donation) => ({ at: new Date(donation.prepared_at), donation }))
    .filter(({ at }) => at.getTime() >= cutoff && at.getTime() <= now.getTime())
    .map(({ at, donation }) => ({
      at,
      meals: donation.meals,
      minuteOfDay: at.getHours() * 60 + at.getMinutes(),
      weight: recencyWeight((now.getTime() - at.getTime()) / DAY_MS),
    }));
}

/**
 * Forecasts surplus for one donor over the next `horizonHours`.
 *
 * `donations` must be that donor's own history — the caller filters, because
 * it already has the list and re-filtering per donor is wasteful.
 */
export function forecastSurplus(
  donor: Organisation,
  donations: Donation[],
  now: Date = new Date(),
  horizonHours = 24,
): SurplusForecast {
  const history = collectHistory(donations, now);
  const sample_size = history.length;

  if (sample_size === 0) {
    return {
      organisation_id: donor.id,
      organisation_name: donor.name,
      probability: 0,
      expected_meals: 0,
      meals_low: 0,
      meals_high: 0,
      window_start: now.toISOString(),
      window_end: new Date(now.getTime() + horizonHours * 3_600_000).toISOString(),
      projected_waste_risk: 0,
      confidence: "low",
      sample_size: 0,
      reasons: [
        `${donor.name} has not posted surplus in the last ${HISTORY_WINDOW_DAYS} days, so there is nothing to forecast from.`,
      ],
    };
  }

  const weights = history.map((h) => h.weight);
  const meals = history.map((h) => h.meals);

  /* -- How often? --------------------------------------------------------- */
  // Recency-weighted donations per day, converted to the chance of at least
  // one in the horizon via a Poisson tail: P(N >= 1) = 1 - e^(-rate * days).
  const weightedCount = weights.reduce((a, b) => a + b, 0);
  const effectiveDays = Math.min(HISTORY_WINDOW_DAYS, RECENCY_HALF_LIFE_DAYS * 2);
  const ratePerDay = weightedCount / effectiveDays;
  const horizonDays = horizonHours / 24;
  const probability = clamp(
    Math.round((1 - Math.exp(-ratePerDay * horizonDays)) * 100),
    0,
    99,
  );

  /* -- How much? ---------------------------------------------------------- */
  // Batch sizes are positive and right-skewed, so the interval is computed in
  // log space. A plain mean ± standard deviation on this data produces bands
  // like "84 meals (1–204)", which is arithmetically true and useless: the low
  // end collapses towards zero and the band stops being a forecast.
  const logs = meals.map((m) => Math.log(Math.max(1, m)));
  const logMean = weightedMean(logs, weights);
  const logSpread = weightedStdDev(logs, weights, logMean);

  const expected = weightedMean(meals, weights);
  const expected_meals = Math.round(expected);
  const meals_low = Math.max(1, Math.round(Math.exp(logMean - logSpread)));
  const meals_high = Math.max(
    meals_low + 1,
    Math.round(Math.exp(logMean + logSpread)),
  );

  /* -- When? -------------------------------------------------------------- */
  const typicalMinute = circularMeanMinutes(
    history.map((h) => h.minuteOfDay),
    weights,
  );

  const windowStart = nextOccurrenceOf(typicalMinute, now, horizonHours);
  // A two-hour band around the typical time; tighter would be false precision.
  const window_start = new Date(windowStart.getTime() - 3_600_000).toISOString();
  const window_end = new Date(windowStart.getTime() + 3_600_000).toISOString();

  /* -- What happens if nobody claims it? ---------------------------------- */
  // Reuse the live risk curves so the forecast speaks the same language as the
  // rest of the product: a typical pickup window, unclaimed, at this volume.
  const typicalWindowMinutes = 150;
  const projected_waste_risk = clamp(
    Math.round(
      (0.5 * urgencyPressure(typicalWindowMinutes) +
        0.2 * volumePressure(expected) +
        0.3) *
        100,
    ),
    0,
    100,
  );

  const confidence =
    sample_size >= MIN_SAMPLE_FOR_HIGH
      ? "high"
      : sample_size >= MIN_SAMPLE_FOR_MEDIUM
        ? "medium"
        : "low";

  return {
    organisation_id: donor.id,
    organisation_name: donor.name,
    probability,
    expected_meals,
    meals_low,
    meals_high,
    window_start,
    window_end,
    projected_waste_risk,
    confidence,
    sample_size,
    reasons: buildReasons(
      donor,
      sample_size,
      ratePerDay,
      expected_meals,
      meals_low,
      meals_high,
      typicalMinute,
      confidence,
    ),
  };
}

/** The next time today or tomorrow that the donor's typical hour comes round. */
function nextOccurrenceOf(minuteOfDay: number, now: Date, horizonHours: number): Date {
  const candidate = new Date(now);
  candidate.setHours(Math.floor(minuteOfDay / 60), Math.round(minuteOfDay % 60), 0, 0);
  if (candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + 1);
  }
  // Never predict beyond the horizon we were asked about.
  const limit = now.getTime() + horizonHours * 3_600_000;
  return candidate.getTime() > limit ? new Date(limit) : candidate;
}

function formatClock(minuteOfDay: number): string {
  const h = Math.floor(minuteOfDay / 60) % 24;
  const m = Math.round(minuteOfDay % 60);
  const period = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function buildReasons(
  donor: Organisation,
  sample: number,
  ratePerDay: number,
  expected: number,
  low: number,
  high: number,
  typicalMinute: number,
  confidence: SurplusForecast["confidence"],
): string[] {
  const perWeek = ratePerDay * 7;
  const reasons = [
    `${sample} donation${sample === 1 ? "" : "s"} in the last ${HISTORY_WINDOW_DAYS} days, weighted towards recent activity`,
    `Averages about ${perWeek.toFixed(1)} surplus posts a week`,
    `Typical batch is ${expected} meals (usually ${low}–${high})`,
    `Surplus usually appears around ${formatClock(typicalMinute)}`,
  ];

  if (confidence === "low") {
    reasons.push(
      "Too few past donations for a reliable estimate — treat this as indicative only",
    );
  }

  return reasons;
}

/**
 * Forecasts every donor and returns them worst-first, so a coordinator sees
 * where to pre-arrange recipients before the food even exists.
 */
export function forecastAllDonors(
  donors: Organisation[],
  donationsByDonor: Map<string, Donation[]>,
  now: Date = new Date(),
  horizonHours = 24,
): SurplusForecast[] {
  return donors
    .map((donor) =>
      forecastSurplus(donor, donationsByDonor.get(donor.id) ?? [], now, horizonHours),
    )
    .sort(
      (a, b) =>
        b.probability * b.expected_meals - a.probability * a.expected_meals,
    );
}

/** Shelf life is what turns "surplus exists" into "surplus is urgent". */
export function forecastUrgencyNote(forecast: SurplusForecast): string {
  const shelf = SHELF_LIFE_MINUTES.cooked_meal / 60;
  if (forecast.probability === 0) return "No forecast available.";
  return `If this surplus is cooked food it will hold for roughly ${shelf} hours, so a recipient should be lined up before ${new Date(
    forecast.window_end,
  ).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}.`;
}
