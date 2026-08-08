import { LandingClient } from "@/components/landing-client";
import { isDemoMode } from "@/lib/db";
import { getImpactStats } from "@/lib/service";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [stats, session] = await Promise.all([getImpactStats(), getSession()]);
  const demo = isDemoMode();

  return <LandingClient stats={stats} session={session} demo={demo} />;
}
