import type { Metadata } from "next";

import { DonationsClient } from "@/app/(app)/donations/donations-client";
import { getDb } from "@/lib/db";
import { scoreDonations } from "@/lib/service";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Donations" };
export const dynamic = "force-dynamic";

type Scope = "mine" | "open" | "all";

export default async function DonationsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const { organisation } = await requireSession();
  const { scope: rawScope } = await searchParams;

  const scope: Scope =
    rawScope === "open" || rawScope === "all" ? rawScope : "mine";

  const db = getDb();

  const donations =
    scope === "open"
      ? await db.listDonations({ status: ["available"] })
      : scope === "all"
        ? await db.listDonations()
        : organisation.role === "donor"
          ? await db.listDonations({ donor_id: organisation.id })
          : await db.listDonations({ matched_recipient_id: organisation.id });

  const scored = await scoreDonations(donations);

  return (
    <DonationsClient scored={scored} role={organisation.role} scope={scope} />
  );
}
