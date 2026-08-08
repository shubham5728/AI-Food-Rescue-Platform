import { NextResponse } from "next/server";

import { apiError } from "@/lib/api";
import { getSurplusForecasts } from "@/lib/service";
import { requireSession } from "@/lib/session";

/** AI feature #1 — where surplus is likely to appear next. */
export async function GET(request: Request) {
  try {
    await requireSession();

    const horizon = Number(
      new URL(request.url).searchParams.get("hours") ?? "24",
    );
    const hours = Number.isFinite(horizon) ? Math.min(72, Math.max(1, horizon)) : 24;

    const forecasts = await getSurplusForecasts(hours);
    return NextResponse.json({ horizon_hours: hours, forecasts });
  } catch (error) {
    return apiError(error);
  }
}
