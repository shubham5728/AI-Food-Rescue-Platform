import { applyHardConstraints } from "@/lib/ai/constraints";
import { rankCandidates, type ScoredMatch } from "@/lib/ai/match";
import { analyseDonation, rescoreForList } from "@/lib/ai/pipeline";
import type { PriorityAssessment } from "@/lib/ai/priority";
import type { RiskAssessment } from "@/lib/ai/risk";
import { planAllocation } from "@/lib/ai/allocation";
import { forecastAllDonors } from "@/lib/ai/forecast";
import { findDemandHotspots, planBestRoute } from "@/lib/ai/route";
import {
  FOOD_CATEGORY_LABELS,
  KG_PER_MEAL,
  MEALS_PER_PERSON,
  RESCUED_STATUSES,
  STATUS_FLOW,
  STATUS_LABELS,
  STATUS_TRANSITIONS,
  TERMINAL_STATUSES,
} from "@/lib/constants";
import { getDb } from "@/lib/db";
import type {
  AiPerformanceStats,
  AllocationPlan,
  CategoryShare,
  DemandHotspot,
  Donation,
  ImpactBreakdown,
  LifecycleStage,
  OrganisationContribution,
  DonationStatus,
  DonationWithRelations,
  ImpactStats,
  ImpactTimePoint,
  MatchWithRecipient,
  Organisation,
  RejectedCandidate,
  RoutePlan,
  SurplusForecast,
} from "@/lib/types";
import { localityOf, newId } from "@/lib/utils";
import type { CreateDonationInput } from "@/lib/validation";
import { assertVerifiedFor, clearVerifications } from "@/lib/verification";

/**
 * Application services.
 *
 * Everything a route handler or server component needs sits here: storage and
 * the AI pipeline are composed in one place so a donation can never be written
 * without being analysed, and a status can never change without its history
 * row and a re-scored priority.
 */

export class ServiceError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

async function verifiedRecipients(): Promise<Organisation[]> {
  const db = getDb();
  return db.listOrganisations("recipient");
}

/* -------------------------------------------------------------------------- */
/* Donations                                                                  */
/* -------------------------------------------------------------------------- */

export async function createDonation(
  input: CreateDonationInput,
  donor: Organisation,
): Promise<{ donation: Donation; analysis: Awaited<ReturnType<typeof analyseDonation>> }> {
  const db = getDb();
  const now = new Date();

  const weight_kg =
    input.quantity_unit === "kg"
      ? Math.round(input.quantity)
      : Math.round(input.meals * KG_PER_MEAL);

  const draft: Donation = {
    id: newId("don"),
    donor_id: donor.id,
    food_name: input.food_name,
    food_type: input.food_type,
    quantity: input.quantity,
    quantity_unit: input.quantity_unit,
    meals: input.meals,
    weight_kg,
    dietary_type: input.dietary_type,
    allergens: input.allergens,
    prepared_at: input.prepared_at,
    pickup_start: input.pickup_start,
    pickup_deadline: input.pickup_deadline,
    latitude: input.latitude,
    longitude: input.longitude,
    address: input.address,
    notes: input.notes ?? null,
    status: "available",
    matched_recipient_id: null,
    waste_risk_score: 0,
    waste_risk_level: "LOW",
    waste_risk_reasons: [],
    waste_risk_explanation: "",
    priority_score: 0,
    priority_level: "LOW",
    priority_reason: "",
    ai_source: "engine",
    analysed_at: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  // Analyse before the first write so a donation is never stored unscored.
  const analysis = await analyseDonation(draft, await verifiedRecipients(), { now });
  const donation = await db.createDonation({ ...draft, ...analysis.donationPatch });

  await db.replaceMatches(donation.id, analysis.matchRows);
  await db.appendHistory({
    id: newId("hist"),
    donation_id: donation.id,
    status: "available",
    note: "Donation created and analysed",
    created_at: now.toISOString(),
  });

  return { donation, analysis };
}

/** Re-runs the full pipeline. Risk and priority are functions of "now". */
export async function reanalyseDonation(donationId: string): Promise<Donation> {
  const db = getDb();
  const donation = await db.getDonationById(donationId);
  if (!donation) throw new ServiceError("Donation not found", 404);

  const analysis = await analyseDonation(donation, await verifiedRecipients());
  const updated = await db.updateDonation(donationId, analysis.donationPatch);
  await db.replaceMatches(donationId, analysis.matchRows);
  return updated;
}

export async function acceptDonation(
  donationId: string,
  recipient: Organisation,
): Promise<Donation> {
  const db = getDb();
  const donation = await db.getDonationById(donationId);
  if (!donation) throw new ServiceError("Donation not found", 404);

  if (donation.status !== "available") {
    throw new ServiceError(
      donation.matched_recipient_id === recipient.id
        ? "You have already accepted this donation"
        : "This donation has already been claimed by another organisation",
      409,
    );
  }

  // Re-check the hard constraints at accept time: the deadline may have moved
  // inside the recipient's reach since the match was computed.
  const { viable, rejected } = applyHardConstraints(donation, [recipient]);
  if (viable.length === 0) {
    throw new ServiceError(
      rejected[0]?.reason ?? "Your organisation cannot accept this donation",
      409,
    );
  }

  return transitionStatus(donationId, "matched", {
    note: `Accepted by ${recipient.name}`,
    recipientId: recipient.id,
  });
}

export async function transitionStatus(
  donationId: string,
  next: DonationStatus,
  options: {
    note?: string | null;
    recipientId?: string;
    /** Only for flows that have already verified, or that never needed to. */
    skipVerification?: boolean;
  } = {},
): Promise<Donation> {
  const db = getDb();
  const donation = await db.getDonationById(donationId);
  if (!donation) throw new ServiceError("Donation not found", 404);

  const allowed = STATUS_TRANSITIONS[donation.status];
  if (!allowed.includes(next)) {
    throw new ServiceError(
      `Cannot move a donation from "${donation.status}" to "${next}"`,
      409,
    );
  }

  if (next === "matched" && !options.recipientId && !donation.matched_recipient_id) {
    throw new ServiceError("A recipient is required to mark a donation matched");
  }

  // Collection and delivery each need their one-time code redeemed first. This
  // is what stops "picked up" from being a button anyone can press.
  if (!options.skipVerification) {
    assertVerifiedFor(donationId, next);
  }

  const patch: Partial<Donation> = { status: next };

  if (options.recipientId) patch.matched_recipient_id = options.recipientId;
  // Returning to "available" releases the claim so others can match on it.
  if (next === "available") patch.matched_recipient_id = null;

  const updated = await db.updateDonation(donationId, patch);

  await db.appendHistory({
    id: newId("hist"),
    donation_id: donationId,
    status: next,
    note: options.note ?? null,
    created_at: new Date().toISOString(),
  });

  // Once the donation is finished, its one-time codes are dead weight.
  if (TERMINAL_STATUSES.includes(next)) clearVerifications(donationId);

  // Risk and priority both depend on claim status, so re-score every move.
  const analysis = await analyseDonation(updated, await verifiedRecipients());
  const rescored = await db.updateDonation(donationId, analysis.donationPatch);
  await db.replaceMatches(donationId, analysis.matchRows);

  return rescored;
}

/**
 * Seeded donations arrive unanalysed so the seed stays synchronous. The first
 * time one is opened it gets a real analysis pass, persisted — deterministic
 * only, because a page render should not block on (or pay for) an LLM call.
 */
async function ensureAnalysed(donation: Donation): Promise<Donation> {
  if (donation.analysed_at) return donation;

  const db = getDb();
  const analysis = await analyseDonation(donation, await verifiedRecipients(), {
    useLlm: false,
  });
  const updated = await db.updateDonation(donation.id, analysis.donationPatch);
  await db.replaceMatches(donation.id, analysis.matchRows);
  return updated;
}

export async function getDonationWithRelations(
  id: string,
): Promise<DonationWithRelations | null> {
  const db = getDb();
  const stored = await db.getDonationById(id);
  if (!stored) return null;

  const donation = await ensureAnalysed(stored);

  const [donor, matches, history] = await Promise.all([
    db.getOrganisationById(donation.donor_id),
    db.listMatches(id),
    db.listHistory(id),
  ]);

  const recipientIds = new Set(matches.map((m) => m.recipient_id));
  if (donation.matched_recipient_id) recipientIds.add(donation.matched_recipient_id);

  const recipients = await Promise.all(
    [...recipientIds].map((rid) => db.getOrganisationById(rid)),
  );
  const byId = new Map(
    recipients.filter((r): r is Organisation => r !== null).map((r) => [r.id, r]),
  );

  const matchesWithRecipient: MatchWithRecipient[] = matches
    .filter((m) => byId.has(m.recipient_id))
    .map((m) => ({ ...m, recipient: byId.get(m.recipient_id)! }));

  return {
    ...donation,
    donor: donor!,
    matched_recipient: donation.matched_recipient_id
      ? (byId.get(donation.matched_recipient_id) ?? null)
      : null,
    matches: matchesWithRecipient,
    history,
  };
}

/** Live constraint pass for the donation page's "ruled out" panel. */
export async function getRejectedCandidates(
  donation: Donation,
): Promise<RejectedCandidate[]> {
  const { rejected } = applyHardConstraints(donation, await verifiedRecipients());
  return rejected;
}

/* -------------------------------------------------------------------------- */
/* AI feature #1 — surplus forecasting                                        */
/* -------------------------------------------------------------------------- */

/**
 * Forecasts upcoming surplus for every donor. Each donor's history is grouped
 * once rather than re-scanned per donor, because this runs on the dashboard.
 */
export async function getSurplusForecasts(
  horizonHours = 24,
): Promise<SurplusForecast[]> {
  const db = getDb();
  const [donors, all] = await Promise.all([
    db.listOrganisations("donor"),
    db.listDonations(),
  ]);

  const byDonor = new Map<string, Donation[]>();
  for (const donation of all) {
    const list = byDonor.get(donation.donor_id);
    if (list) list.push(donation);
    else byDonor.set(donation.donor_id, [donation]);
  }

  return forecastAllDonors(donors, byDonor, new Date(), horizonHours);
}

/* -------------------------------------------------------------------------- */
/* AI feature #6 — smart allocation                                           */
/* -------------------------------------------------------------------------- */

/** Splits a donation across recipients when no single one can take it all. */
export async function getAllocationPlan(
  donationId: string,
): Promise<AllocationPlan> {
  const db = getDb();
  const donation = await db.getDonationById(donationId);
  if (!donation) throw new ServiceError("Donation not found", 404);

  // Partial matching: a recipient qualifies if it can take a useful share,
  // not only if it can swallow the whole donation.
  const { viable } = applyHardConstraints(
    donation,
    await verifiedRecipients(),
    new Date(),
    { allowPartial: true },
  );
  return planAllocation(donation, viable);
}

/* -------------------------------------------------------------------------- */
/* AI feature #8 — routing and hotspots                                       */
/* -------------------------------------------------------------------------- */

export interface RouteResult {
  plan: RoutePlan;
  strategy: "shortest" | "deadline-first";
  note: string;
}

/**
 * Builds a collection run for one recipient over the donations it has claimed
 * but not yet collected. Starting point is the recipient's own address.
 */
export async function getCollectionRoute(
  recipient: Organisation,
): Promise<RouteResult> {
  const db = getDb();
  const claimed = await db.listDonations({
    matched_recipient_id: recipient.id,
    status: ["matched", "pickup_scheduled", "pickup_assigned"],
  });

  return planBestRoute(
    { latitude: recipient.latitude, longitude: recipient.longitude },
    claimed,
  );
}

export async function getDemandHotspots(): Promise<DemandHotspot[]> {
  const db = getDb();
  const [recipients, active] = await Promise.all([
    db.listOrganisations("recipient"),
    db.listDonations({ activeOnly: true }),
  ]);
  return findDemandHotspots(recipients, active);
}

/* -------------------------------------------------------------------------- */
/* Dashboards                                                                 */
/* -------------------------------------------------------------------------- */

export interface ScoredDonation {
  donation: Donation;
  donor: Organisation;
  risk: RiskAssessment;
  priority: PriorityAssessment;
  viable: number;
}

/**
 * Re-scores a set of donations against the current clock. Stored scores go
 * stale the moment they are written — a donation that was medium risk an hour
 * ago is high risk now — so every list view recomputes.
 */
export async function scoreDonations(
  donations: Donation[],
): Promise<ScoredDonation[]> {
  const db = getDb();
  const [recipients, orgs] = await Promise.all([
    verifiedRecipients(),
    db.listOrganisations(),
  ]);
  const byId = new Map(orgs.map((o) => [o.id, o]));
  const now = new Date();

  return donations.map((donation) => {
    const { risk, priority, viable } = rescoreForList(donation, recipients, now);
    return { donation, donor: byId.get(donation.donor_id)!, risk, priority, viable };
  });
}

export async function getImpactStats(): Promise<ImpactStats> {
  const db = getDb();
  const all = await db.listDonations();

  const rescued = all.filter((d) => RESCUED_STATUSES.includes(d.status));
  const active = all.filter((d) => !TERMINAL_STATUSES.includes(d.status));
  const cancelled = all.filter((d) => d.status === "cancelled");

  const scoredActive = await scoreDonations(active);
  const highRisk = scoredActive.filter((s) => s.risk.level === "HIGH");

  const meals_donated = rescued.reduce((sum, d) => sum + d.meals, 0);

  // Everything that reached an end state, so the success rate has a denominator
  // that includes the failures rather than only counting the wins.
  const settled = rescued.length + cancelled.length;
  const rescue_success_rate =
    settled === 0 ? 0 : Math.round((rescued.length / settled) * 100);

  const donorIds = new Set(all.map((d) => d.donor_id));
  const recipientIds = new Set(
    all.map((d) => d.matched_recipient_id).filter((id): id is string => Boolean(id)),
  );

  return {
    meals_donated,
    food_saved_kg: rescued.reduce((sum, d) => sum + d.weight_kg, 0),
    donations_completed: rescued.length,
    people_served: Math.round(meals_donated / MEALS_PER_PERSON),
    meals_at_risk: highRisk.reduce((sum, s) => sum + s.donation.meals, 0),
    active_donations: active.length,
    high_risk_donations: highRisk.length,
    meals_lost: cancelled.reduce((sum, d) => sum + d.meals, 0),
    rescue_success_rate,
    active_donors: donorIds.size,
    active_recipients: recipientIds.size,
  };
}

/**
 * How well the AI layer is actually doing — not how often it ran.
 *
 * The number that matters most here is `top_pick_acceptance`: if recipients
 * routinely accept donations the engine ranked second or third, the ranking is
 * not modelling what they care about, and that is worth knowing.
 */
export async function getAiPerformance(): Promise<AiPerformanceStats> {
  const db = getDb();
  const [all, recipients] = await Promise.all([
    db.listDonations(),
    verifiedRecipients(),
  ]);

  const analysed = all.filter((d) => d.analysed_at !== null);
  const claimed = all.filter((d) => d.matched_recipient_id !== null);

  let withViable = 0;
  let filteredTotal = 0;
  for (const donation of analysed) {
    const { viable, rejected } = applyHardConstraints(donation, recipients);
    if (viable.length > 0) withViable += 1;
    filteredTotal += rejected.length;
  }

  let topPickHits = 0;
  let scoreTotal = 0;
  let scoreCount = 0;
  for (const donation of claimed) {
    const matches = await db.listMatches(donation.id);
    if (matches.length === 0) continue;
    const chosen = matches.find((m) => m.recipient_id === donation.matched_recipient_id);
    if (!chosen) continue;
    scoreTotal += chosen.match_score;
    scoreCount += 1;
    if (chosen.rank === 1) topPickHits += 1;
  }

  const highRiskDonations = all.filter((d) => d.waste_risk_level === "HIGH");
  const highRiskSaved = highRiskDonations.filter((d) =>
    RESCUED_STATUSES.includes(d.status),
  );

  const pct = (part: number, whole: number) =>
    whole === 0 ? 0 : Math.round((part / whole) * 100);

  return {
    match_coverage: pct(withViable, analysed.length),
    top_pick_acceptance: pct(topPickHits, scoreCount),
    average_accepted_score: scoreCount === 0 ? 0 : Math.round(scoreTotal / scoreCount),
    high_risk_save_rate: pct(highRiskSaved.length, highRiskDonations.length),
    average_filtered_out:
      analysed.length === 0
        ? 0
        : Number((filteredTotal / analysed.length).toFixed(1)),
    analysed_donations: analysed.length,
    explained_by_llm: analysed.filter((d) => d.ai_source === "openai").length,
    explained_by_engine: analysed.filter((d) => d.ai_source === "engine").length,
  };
}

/**
 * kg CO2e avoided per kg of food kept out of landfill.
 *
 * Landfilled food decomposes anaerobically and releases methane; diverting it
 * avoids that plus the embodied emissions of the wasted production. Published
 * estimates cluster around 1.9–3.6 depending on food mix and landfill gas
 * capture, so the midpoint is used and the range is reported alongside it.
 * The page shows the factor rather than only the product, because a bare
 * "2,888 kg CO2e avoided" is a number nobody can check.
 */
const CO2E_PER_KG_FOOD = 2.5;
const CO2E_PER_KG_LOW = 1.9;
const CO2E_PER_KG_HIGH = 3.6;

/**
 * Everything the impact page reports, computed from stored donations.
 *
 * No figure here is invented: each one traces to rows in the database. Where a
 * number is an estimate rather than a measurement (carbon), it carries its
 * assumption with it.
 */
export async function getImpactBreakdown(): Promise<ImpactBreakdown> {
  const db = getDb();
  const [all, organisations] = await Promise.all([
    db.listDonations(),
    db.listOrganisations(),
  ]);

  const byId = new Map(organisations.map((o) => [o.id, o]));
  const rescued = all.filter((d) => RESCUED_STATUSES.includes(d.status));
  const totalMeals = rescued.reduce((sum, d) => sum + d.meals, 0);

  /* -- Food categories ---------------------------------------------------- */
  const categoryTotals = new Map<string, { meals: number; kg: number }>();
  for (const d of rescued) {
    const entry = categoryTotals.get(d.food_type) ?? { meals: 0, kg: 0 };
    entry.meals += d.meals;
    entry.kg += d.weight_kg;
    categoryTotals.set(d.food_type, entry);
  }

  const by_category: CategoryShare[] = [...categoryTotals.entries()]
    .map(([key, v]) => ({
      key,
      label: FOOD_CATEGORY_LABELS[key as keyof typeof FOOD_CATEGORY_LABELS] ?? key,
      meals: v.meals,
      kg: Math.round(v.kg),
      share: totalMeals === 0 ? 0 : Math.round((v.meals / totalMeals) * 100),
    }))
    .sort((a, b) => b.meals - a.meals);

  /* -- Contribution by organisation --------------------------------------- */
  const contribution = (
    keyOf: (d: Donation) => string | null,
  ): OrganisationContribution[] => {
    const totals = new Map<
      string,
      { meals: number; donations: number; finished: number }
    >();

    for (const d of all) {
      const key = keyOf(d);
      if (!key) continue;
      const entry = totals.get(key) ?? { meals: 0, donations: 0, finished: 0 };

      if (RESCUED_STATUSES.includes(d.status)) {
        entry.meals += d.meals;
        entry.donations += 1;
        entry.finished += 1;
      } else if (d.status === "cancelled") {
        entry.finished += 1;
      }
      totals.set(key, entry);
    }

    return [...totals.entries()]
      .map(([id, v]) => {
        const org = byId.get(id);
        return {
          id,
          name: org?.name ?? id,
          locality: org ? localityOf(org.address) : "",
          meals: v.meals,
          donations: v.donations,
          completion_rate:
            v.finished === 0 ? 0 : Math.round((v.donations / v.finished) * 100),
        };
      })
      .filter((c) => c.donations > 0)
      .sort((a, b) => b.meals - a.meals);
  };

  const by_donor = contribution((d) => d.donor_id);
  const by_recipient = contribution((d) => d.matched_recipient_id);

  /* -- Lifecycle ---------------------------------------------------------- */
  const lifecycle: LifecycleStage[] = STATUS_FLOW.map((status) => {
    const rows = all.filter((d) => d.status === status);
    return {
      status,
      label: STATUS_LABELS[status],
      count: rows.length,
      meals: rows.reduce((sum, d) => sum + d.meals, 0),
    };
  });

  /* -- Environmental estimate --------------------------------------------- */
  const food_kg = rescued.reduce((sum, d) => sum + d.weight_kg, 0);

  return {
    by_category,
    by_donor,
    by_recipient,
    lifecycle,
    environmental: {
      food_kg: Math.round(food_kg),
      co2e_kg: Math.round(food_kg * CO2E_PER_KG_FOOD),
      factor: CO2E_PER_KG_FOOD,
      factor_source:
        "Midpoint of published estimates for food waste diverted from landfill",
      factor_low: CO2E_PER_KG_LOW,
      factor_high: CO2E_PER_KG_HIGH,
      co2e_low: Math.round(food_kg * CO2E_PER_KG_LOW),
      co2e_high: Math.round(food_kg * CO2E_PER_KG_HIGH),
    },
    first_delivery:
      rescued.length === 0
        ? null
        : rescued
            .map((d) => d.updated_at)
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0],
  };
}

/** Daily impact series for the dashboard charts. */
export async function getImpactTimeline(days = 30): Promise<ImpactTimePoint[]> {
  const db = getDb();
  const all = await db.listDonations();
  const now = new Date();

  const buckets = new Map<string, ImpactTimePoint>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, {
      date: key,
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      meals: 0,
      kg: 0,
      completed: 0,
      at_risk: 0,
    });
  }

  for (const donation of all) {
    const key = donation.updated_at.slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;

    if (donation.status === "delivered") {
      bucket.meals += donation.meals;
      bucket.kg += donation.weight_kg;
      bucket.completed += 1;
    } else if (donation.waste_risk_level === "HIGH") {
      bucket.at_risk += donation.meals;
    }
  }

  return [...buckets.values()];
}

/* -------------------------------------------------------------------------- */
/* Recipient feed                                                             */
/* -------------------------------------------------------------------------- */

export interface RecipientOffer {
  donation: Donation;
  donor: Organisation;
  match: ScoredMatch;
  risk: RiskAssessment;
}

/**
 * What a recipient sees: only donations that clear every hard constraint for
 * *their* organisation, each scored from their point of view and ranked.
 */
export async function getRecipientOffers(
  recipient: Organisation,
): Promise<RecipientOffer[]> {
  const db = getDb();
  const [available, orgs, recipients] = await Promise.all([
    db.listDonations({ status: ["available"] }),
    db.listOrganisations(),
    verifiedRecipients(),
  ]);
  const byId = new Map(orgs.map((o) => [o.id, o]));
  const now = new Date();

  const offers: RecipientOffer[] = [];

  for (const donation of available) {
    const { viable } = applyHardConstraints(donation, [recipient], now);
    if (viable.length === 0) continue;

    const [match] = rankCandidates(donation, viable);
    const { risk } = rescoreForList(donation, recipients, now);
    offers.push({ donation, donor: byId.get(donation.donor_id)!, match, risk });
  }

  return offers.sort(
    (a, b) => b.match.score - a.match.score || a.match.distance_km - b.match.distance_km,
  );
}

/** Donations this recipient has accepted and is responsible for. */
export async function getRecipientCommitments(
  recipient: Organisation,
): Promise<ScoredDonation[]> {
  const db = getDb();
  const donations = await db.listDonations({
    matched_recipient_id: recipient.id,
  });
  const scored = await scoreDonations(donations);
  return scored.sort(
    (a, b) =>
      new Date(a.donation.pickup_deadline).getTime() -
      new Date(b.donation.pickup_deadline).getTime(),
  );
}
