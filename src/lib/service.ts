import { applyHardConstraints } from "@/lib/ai/constraints";
import { rankCandidates, type ScoredMatch } from "@/lib/ai/match";
import { analyseDonation, rescoreForList } from "@/lib/ai/pipeline";
import type { PriorityAssessment } from "@/lib/ai/priority";
import type { RiskAssessment } from "@/lib/ai/risk";
import {
  KG_PER_MEAL,
  MEALS_PER_PERSON,
  STATUS_TRANSITIONS,
} from "@/lib/constants";
import { getDb } from "@/lib/db";
import type {
  Donation,
  DonationStatus,
  DonationWithRelations,
  ImpactStats,
  ImpactTimePoint,
  MatchWithRecipient,
  Organisation,
  RejectedCandidate,
} from "@/lib/types";
import { newId } from "@/lib/utils";
import type { CreateDonationInput } from "@/lib/validation";

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
  options: { note?: string | null; recipientId?: string } = {},
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

  const delivered = all.filter((d) => d.status === "delivered");
  const active = all.filter(
    (d) => d.status !== "delivered" && d.status !== "cancelled",
  );

  const scoredActive = await scoreDonations(active);
  const highRisk = scoredActive.filter((s) => s.risk.level === "HIGH");

  const meals_donated = delivered.reduce((sum, d) => sum + d.meals, 0);

  return {
    meals_donated,
    food_saved_kg: delivered.reduce((sum, d) => sum + d.weight_kg, 0),
    donations_completed: delivered.length,
    people_served: Math.round(meals_donated / MEALS_PER_PERSON),
    meals_at_risk: highRisk.reduce((sum, s) => sum + s.donation.meals, 0),
    active_donations: active.length,
    high_risk_donations: highRisk.length,
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
