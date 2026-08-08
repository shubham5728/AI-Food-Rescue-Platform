import type { Metadata } from "next";

import { DonorDashboard } from "@/components/dashboard/donor-dashboard";
import { RecipientDashboard } from "@/components/dashboard/recipient-dashboard";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { organisation } = await requireSession();

  return organisation.role === "donor" ? (
    <DonorDashboard organisation={organisation} />
  ) : (
    <RecipientDashboard organisation={organisation} />
  );
}
