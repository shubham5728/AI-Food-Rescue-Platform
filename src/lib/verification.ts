import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

import type { DonationStatus, PickupVerification } from "@/lib/types";
import { VERIFIED_TRANSITIONS } from "@/lib/constants";

/**
 * Pickup verification — the handshake that proves a handover really happened.
 *
 * Two moments are protected:
 *
 *   collection — the collector arrives at the donor and reads back a code the
 *                donor can see. Without it, anyone could mark food "picked up".
 *   delivery   — the recipient confirms the food actually arrived, which is
 *                what the impact dashboard then counts.
 *
 * Codes are short-lived and single-use, with an attempt limit so a 6-digit
 * code cannot be brute-forced. They live in memory rather than the database:
 * they expire within the hour and never need to outlive the pickup, so
 * persisting them would add three adapter implementations for no benefit.
 */

/** How long a code stays valid. Long enough for traffic, short enough to matter. */
const TTL_MINUTES = 90;
/** Wrong guesses before the code is burned and must be reissued. */
const MAX_ATTEMPTS = 5;

const GLOBAL_KEY = Symbol.for("foodbridge.pickup.verifications");

type Store = Map<string, PickupVerification>;

function store(): Store {
  const holder = globalThis as unknown as Record<symbol, Store | undefined>;
  if (!holder[GLOBAL_KEY]) holder[GLOBAL_KEY] = new Map();
  return holder[GLOBAL_KEY]!;
}

const keyFor = (donationId: string, stage: PickupVerification["stage"]) =>
  `${donationId}:${stage}`;

function secret(): string {
  return process.env.SESSION_SECRET || "foodbridge-development-secret";
}

/**
 * The QR payload is signed, so a scanner can trust it came from us. It carries
 * no secret of its own — scanning it is equivalent to reading the code aloud.
 */
function signPayload(donationId: string, stage: string, code: string): string {
  const body = `${donationId}.${stage}.${code}`;
  const signature = createHmac("sha256", secret()).update(body).digest("base64url");
  return `foodbridge://verify/${body}.${signature}`;
}

export class VerificationError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "VerificationError";
  }
}

/** Issues (or reissues) the code for one stage of a donation's handover. */
export function issueVerification(
  donationId: string,
  stage: PickupVerification["stage"],
  now: Date = new Date(),
): PickupVerification {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");

  const record: PickupVerification = {
    donation_id: donationId,
    code,
    qr_payload: signPayload(donationId, stage, code),
    stage,
    issued_at: now.toISOString(),
    expires_at: new Date(now.getTime() + TTL_MINUTES * 60_000).toISOString(),
    verified_at: null,
    attempts: 0,
  };

  store().set(keyFor(donationId, stage), record);
  return record;
}

export function getVerification(
  donationId: string,
  stage: PickupVerification["stage"],
): PickupVerification | null {
  return store().get(keyFor(donationId, stage)) ?? null;
}

/** Issues a code only if there isn't already a live, unredeemed one. */
export function ensureVerification(
  donationId: string,
  stage: PickupVerification["stage"],
  now: Date = new Date(),
): PickupVerification {
  const existing = getVerification(donationId, stage);
  if (
    existing &&
    !existing.verified_at &&
    new Date(existing.expires_at).getTime() > now.getTime() &&
    existing.attempts < MAX_ATTEMPTS
  ) {
    return existing;
  }
  return issueVerification(donationId, stage, now);
}

/**
 * Redeems a code. Accepts either the 6 digits or a scanned QR payload, since
 * the collector may do one or the other.
 *
 * Throws on every failure path rather than returning false, so a caller cannot
 * accidentally treat "expired" as "verified" by ignoring a boolean.
 */
export function redeemVerification(
  donationId: string,
  stage: PickupVerification["stage"],
  submitted: string,
  now: Date = new Date(),
): PickupVerification {
  const record = getVerification(donationId, stage);

  if (!record) {
    throw new VerificationError(
      "No verification code has been issued for this step yet",
      409,
    );
  }

  if (record.verified_at) {
    throw new VerificationError("This code has already been used", 409);
  }

  if (new Date(record.expires_at).getTime() <= now.getTime()) {
    throw new VerificationError(
      "That code has expired — ask for a new one to be issued",
      410,
    );
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    throw new VerificationError(
      "Too many incorrect attempts. A new code must be issued.",
      429,
    );
  }

  // A scanned QR carries the code inside the signed payload.
  const trimmed = submitted.trim();
  const candidate = trimmed.startsWith("foodbridge://verify/")
    ? (trimmed.split("/").pop() ?? "").split(".")[2] ?? ""
    : trimmed;

  const expected = Buffer.from(record.code);
  const provided = Buffer.from(candidate.padEnd(record.code.length).slice(0, record.code.length));
  const matches =
    candidate.length === record.code.length && timingSafeEqual(provided, expected);

  if (!matches) {
    record.attempts += 1;
    store().set(keyFor(donationId, stage), record);
    const left = MAX_ATTEMPTS - record.attempts;
    throw new VerificationError(
      left > 0
        ? `That code is not correct. ${left} attempt${left === 1 ? "" : "s"} remaining.`
        : "That code is not correct, and no attempts remain. A new code must be issued.",
      left > 0 ? 400 : 429,
    );
  }

  record.verified_at = now.toISOString();
  store().set(keyFor(donationId, stage), record);
  return record;
}

/** Which stage, if any, must be verified before entering `next`. */
export function stageRequiredFor(
  next: DonationStatus,
): PickupVerification["stage"] | null {
  return VERIFIED_TRANSITIONS[next] ?? null;
}

/**
 * Guard used by the status endpoint: throws unless the code for this step has
 * already been redeemed. This is what makes the OTP more than decoration —
 * the lifecycle cannot advance past it.
 */
export function assertVerifiedFor(
  donationId: string,
  next: DonationStatus,
  now: Date = new Date(),
): void {
  const stage = stageRequiredFor(next);
  if (!stage) return;

  const record = getVerification(donationId, stage);
  if (!record?.verified_at) {
    throw new VerificationError(
      stage === "collection"
        ? "Confirm the donor's pickup code before marking this collected"
        : "Confirm the recipient's delivery code before marking this delivered",
      428,
    );
  }

  if (new Date(record.verified_at).getTime() > now.getTime()) {
    throw new VerificationError("Verification record is invalid", 500);
  }
}

/** Clears codes once a donation reaches a terminal state. */
export function clearVerifications(donationId: string): void {
  store().delete(keyFor(donationId, "collection"));
  store().delete(keyFor(donationId, "delivery"));
}

/** Safe to send to the client: never includes the code itself. */
export function publicVerificationState(
  donationId: string,
): Record<PickupVerification["stage"], { issued: boolean; verified: boolean; expires_at: string | null }> {
  const build = (stage: PickupVerification["stage"]) => {
    const record = getVerification(donationId, stage);
    return {
      issued: Boolean(record),
      verified: Boolean(record?.verified_at),
      expires_at: record?.expires_at ?? null,
    };
  };

  return { collection: build("collection"), delivery: build("delivery") };
}
