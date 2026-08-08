import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, readJson } from "@/lib/api";
import { getDb } from "@/lib/db";
import { acceptDonation, ServiceError } from "@/lib/service";
import { requireSession } from "@/lib/session";

const bodySchema = z.object({
  /** Present when a donor confirms the AI's recommendation on a recipient's behalf. */
  recipient_id: z.string().min(1).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { organisation } = await requireSession();
    const { recipient_id } = bodySchema.parse(await readJson(request));

    let recipient = organisation;

    if (recipient_id) {
      // Donor-initiated: only the donation's own donor may confirm on its behalf.
      const donation = await getDb().getDonationById(id);
      if (!donation) throw new ServiceError("Donation not found", 404);

      if (organisation.role !== "donor" || donation.donor_id !== organisation.id) {
        throw new ServiceError(
          "Only the donating organisation can confirm a recipient for this donation",
          403,
        );
      }

      const target = await getDb().getOrganisationById(recipient_id);
      if (!target || target.role !== "recipient") {
        throw new ServiceError("That recipient organisation does not exist", 404);
      }
      recipient = target;
    } else if (organisation.role !== "recipient") {
      throw new ServiceError("Only recipient organisations can accept a donation", 403);
    }

    const donation = await acceptDonation(id, recipient);
    return NextResponse.json({ donation });
  } catch (error) {
    return apiError(error);
  }
}
