import { NextResponse } from "next/server";

import { apiError } from "@/lib/api";
import { getAiPerformance } from "@/lib/service";
import { requireSession } from "@/lib/session";

/** AI feature #10 — how well the AI layer is actually performing. */
export async function GET() {
  try {
    await requireSession();
    const performance = await getAiPerformance();
    return NextResponse.json({ performance });
  } catch (error) {
    return apiError(error);
  }
}
