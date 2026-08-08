import type { Metadata } from "next";

import { ImpactClient } from "@/app/(app)/impact/impact-client";
import {
  getAiPerformance,
  getImpactBreakdown,
  getImpactStats,
  getImpactTimeline,
} from "@/lib/service";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Impact" };
export const dynamic = "force-dynamic";

export default async function ImpactPage() {
  await requireSession();

  const [stats, timeline, breakdown, performance] = await Promise.all([
    getImpactStats(),
    getImpactTimeline(30),
    getImpactBreakdown(),
    getAiPerformance(),
  ]);

  return (
    <ImpactClient
      stats={stats}
      timeline={timeline}
      breakdown={breakdown}
      performance={performance}
    />
  );
}
