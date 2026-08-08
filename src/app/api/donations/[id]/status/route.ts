import { NextResponse } from "next/server";

import { apiError, readJson } from "@/lib/api";
import { getDb } from "@/lib/db";
import { ServiceError, transitionStatus } from "@/lib/service";
import { requireSession } from "@/lib/session";
import { updateStatusSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { organisation } = await requireSession();
    const { status, note } = updateStatusSchema.parse(await readJson(request));

    const donation = await getDb().getDonationById(id);
    if (!donation) throw new ServiceError("Donation not found", 404);

    // Both sides of a handover need to move it along, but only those two.
    const isDonor = donation.donor_id === organisation.id;
    const isRecipient = donation.matched_recipient_id === organisation.id;
    if (!isDonor && !isRecipient) {
      throw new ServiceError(
        "Only the donor or the matched recipient can update this donation",
        403,
      );
    }

    const updated = await transitionStatus(id, status, {
      note: note ?? `Updated by ${organisation.name}`,
    });

    return NextResponse.json({ donation: updated });
  } catch (error) {
    return apiError(error);
  }
}
