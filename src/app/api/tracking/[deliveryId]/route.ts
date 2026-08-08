import { NextResponse } from "next/server";

import { apiError, readJson } from "@/lib/api";
import { trackingStore } from "@/lib/tracking/store";
import type { DeliveryStatus } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ deliveryId: string }> },
) {
  try {
    const { deliveryId } = await params;
    const trackingState = trackingStore.getTrackingState(deliveryId);

    if (!trackingState) {
      return NextResponse.json(
        { error: `Delivery tracking record ${deliveryId} not found` },
        { status: 404 },
      );
    }

    return NextResponse.json(trackingState);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ deliveryId: string }> },
) {
  try {
    const { deliveryId } = await params;
    const body = (await readJson(request)) as {
      status?: DeliveryStatus;
      note?: string;
    };

    if (!body.status) {
      return NextResponse.json(
        { error: "Delivery status is required" },
        { status: 400 },
      );
    }

    const updatedDelivery = trackingStore.updateDeliveryStatus(
      deliveryId,
      body.status,
      body.note,
    );

    const updatedState = trackingStore.getTrackingState(deliveryId);
    return NextResponse.json({ delivery: updatedDelivery, trackingState: updatedState });
  } catch (error) {
    return apiError(error);
  }
}
