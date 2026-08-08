import { NextResponse } from "next/server";

import { apiError, readJson } from "@/lib/api";
import { trackingStore } from "@/lib/tracking/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ deliveryId: string }> },
) {
  try {
    const { deliveryId } = await params;
    const body = (await readJson(request)) as {
      latitude: number;
      longitude: number;
      accuracy: number;
      speed?: number | null;
      heading?: number | null;
      timestamp?: string;
    };

    if (!body.latitude || !body.longitude) {
      return NextResponse.json(
        { error: "Valid latitude and longitude coordinates are required" },
        { status: 400 },
      );
    }

    const updatedState = trackingStore.updateDriverLocation(deliveryId, {
      driver_id: "drv_rahul",
      latitude: body.latitude,
      longitude: body.longitude,
      accuracy: body.accuracy ?? 10,
      speed: body.speed ?? null,
      heading: body.heading ?? null,
      timestamp: body.timestamp ?? new Date().toISOString(),
    });

    return NextResponse.json(updatedState);
  } catch (error) {
    return apiError(error);
  }
}
