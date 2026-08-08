import { NextResponse } from "next/server";

import { apiError } from "@/lib/api";
import { getImpactStats, getImpactTimeline } from "@/lib/service";

/** Read-only impact feed, used by the landing page counters and for polling. */
export async function GET() {
  try {
    const [stats, timeline] = await Promise.all([
      getImpactStats(),
      getImpactTimeline(30),
    ]);
    return NextResponse.json({ stats, timeline });
  } catch (error) {
    return apiError(error);
  }
}
