import type { Metadata } from "next";

import { ImpactClient } from "@/app/(app)/impact/impact-client";
import { AiPerformancePanel } from "@/components/ai-performance-panel";
import { getAiPerformance, getImpactStats, getImpactTimeline } from "@/lib/service";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Impact" };
export const dynamic = "force-dynamic";

export default async function ImpactPage() {
  await requireSession();

  const [stats, timeline, performance] = await Promise.all([
    getImpactStats(),
    getImpactTimeline(30),
    getAiPerformance(),
  ]);

  return (
    <>
      <ImpactClient stats={stats} timeline={timeline} />
      <div className="container pb-8">
        <AiPerformancePanel performance={performance} stats={stats} />
      </div>
    </>
  );
}
