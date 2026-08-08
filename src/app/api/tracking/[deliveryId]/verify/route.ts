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
      step: "PICKUP" | "DELIVERY";
      otp: string;
      latitude?: number;
      longitude?: number;
    };

    if (!body.step || !body.otp) {
      return NextResponse.json(
        { error: "Step (PICKUP/DELIVERY) and OTP code are required" },
        { status: 400 },
      );
    }

    const result = await trackingStore.verifyOtp(
      deliveryId,
      body.step,
      body.otp,
      body.latitude,
      body.longitude,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 },
      );
    }

    const trackingState = await trackingStore.getTrackingState(deliveryId);
    return NextResponse.json({
      success: true,
      message: result.message,
      trackingState,
    });
  } catch (error) {
    return apiError(error);
  }
}
