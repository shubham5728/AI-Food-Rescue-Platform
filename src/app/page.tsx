import { LandingClient } from "@/components/landing-client";
import { isDemoMode } from "@/lib/db";
import { getLandingSnapshot } from "@/lib/service";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [snapshot, session] = await Promise.all([
    getLandingSnapshot(),
    getSession(),
  ]);

  return (
    <LandingClient
      stats={snapshot.stats}
      snapshot={snapshot}
      session={session}
      demo={isDemoMode()}
    />
  );
}
