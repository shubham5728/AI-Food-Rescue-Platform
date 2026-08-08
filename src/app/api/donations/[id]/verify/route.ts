import { NextResponse } from "next/server";

import { apiError, readJson } from "@/lib/api";
import { getDb } from "@/lib/db";
import { ServiceError } from "@/lib/service";
import { requireSession } from "@/lib/session";
import {
  ensureVerification,
  publicVerificationState,
  redeemVerification,
} from "@/lib/verification";
import { issueVerificationSchema, verifyPickupSchema } from "@/lib/validation";

/**
 * AI feature #9 — pickup verification.
 *
 * Who may do what is deliberately asymmetric:
 *
 *   collection — the DONOR issues the code (they are holding the food) and the
 *                COLLECTOR reads it back.
 *   delivery   — the RECIPIENT issues it on arrival, the collector reads it back.
 *
 * Issuing and redeeming are therefore never the same person, which is the
 * whole point of the handshake.
 */

async function loadParties(id: string, organisationId: string) {
  const donation = await getDb().getDonationById(id);
  if (!donation) throw new ServiceError("Donation not found", 404);

  const isDonor = donation.donor_id === organisationId;
  const isRecipient = donation.matched_recipient_id === organisationId;

  if (!isDonor && !isRecipient) {
    throw new ServiceError(
      "Only the donor or the matched recipient can verify this pickup",
      403,
    );
  }

  return { donation, isDonor, isRecipient };
}

/** Current state — never returns the code itself. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { organisation } = await requireSession();
    await loadParties(id, organisation.id);
    return NextResponse.json({ verification: publicVerificationState(id) });
  } catch (error) {
    return apiError(error);
  }
}

/** Issues (or reissues) a code. Returns it only to the party that holds it. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { organisation } = await requireSession();
    const { isDonor, isRecipient } = await loadParties(id, organisation.id);
    const { stage } = issueVerificationSchema.parse(await readJson(request));

    if (stage === "collection" && !isDonor) {
      throw new ServiceError(
        "The collection code is issued by the donor, who is holding the food",
        403,
      );
    }
    if (stage === "delivery" && !isRecipient) {
      throw new ServiceError(
        "The delivery code is issued by the receiving organisation",
        403,
      );
    }

    const record = ensureVerification(id, stage);

    return NextResponse.json({
      stage: record.stage,
      code: record.code,
      qr_payload: record.qr_payload,
      expires_at: record.expires_at,
    });
  } catch (error) {
    return apiError(error);
  }
}

/** Redeems a code submitted by the other party. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { organisation } = await requireSession();
    const { isDonor, isRecipient } = await loadParties(id, organisation.id);
    const { stage, code } = verifyPickupSchema.parse(await readJson(request));

    // The redeemer must be the counterpart of the issuer.
    if (stage === "collection" && !isRecipient) {
      throw new ServiceError(
        "The collecting organisation redeems the donor's collection code",
        403,
      );
    }
    if (stage === "delivery" && !isDonor && !isRecipient) {
      throw new ServiceError("You are not part of this handover", 403);
    }

    const record = redeemVerification(id, stage, code);

    return NextResponse.json({
      stage: record.stage,
      verified_at: record.verified_at,
      verification: publicVerificationState(id),
    });
  } catch (error) {
    return apiError(error);
  }
}
