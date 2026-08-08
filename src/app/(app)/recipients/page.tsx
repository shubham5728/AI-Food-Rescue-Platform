import type { Metadata } from "next";

import { RecipientsClient } from "@/app/(app)/recipients/recipients-client";
import { getDb } from "@/lib/db";
import { haversineKm } from "@/lib/geo";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Recipient directory" };
export const dynamic = "force-dynamic";

export default async function RecipientsPage() {
  const { organisation } = await requireSession();
  const recipients = await getDb().listOrganisations("recipient");

  const withDistance = recipients
    .map((recipient) => ({
      recipient,
      distance_km: haversineKm(
        organisation.latitude,
        organisation.longitude,
        recipient.latitude,
        recipient.longitude,
      ),
    }))
    .sort((a, b) => a.distance_km - b.distance_km);

  return <RecipientsClient items={withDistance} />;
}
