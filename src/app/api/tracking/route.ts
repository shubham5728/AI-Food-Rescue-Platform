import { NextResponse } from "next/server";

import { apiError } from "@/lib/api";
import { trackingStore } from "@/lib/tracking/store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;

    const deliveries = await trackingStore.listDeliveries(status);
    const trackingStates = await Promise.all(
      deliveries.map((d) => trackingStore.getTrackingState(d.id))
    );

    return NextResponse.json({ deliveries, trackingStates });
  } catch (error) {
    return apiError(error);
  }
}
