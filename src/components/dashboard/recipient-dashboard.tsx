import { RecipientDashboardClient } from "@/components/dashboard/recipient-dashboard-client";
import { getRecipientCommitments, getRecipientOffers } from "@/lib/service";
import type { Organisation } from "@/lib/types";

export async function RecipientDashboard({
  organisation,
}: {
  organisation: Organisation;
}) {
  const [offers, commitments] = await Promise.all([
    getRecipientOffers(organisation),
    getRecipientCommitments(organisation),
  ]);

  const openCommitments = commitments.filter(
    (c) => c.donation.status !== "delivered" && c.donation.status !== "cancelled",
  );

  return (
    <RecipientDashboardClient
      organisation={organisation}
      offers={offers}
      openCommitments={openCommitments}
    />
  );
}
