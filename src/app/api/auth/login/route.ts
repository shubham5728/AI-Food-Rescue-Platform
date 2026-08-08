import { NextResponse } from "next/server";

import { apiError, readJson } from "@/lib/api";
import { getDb } from "@/lib/db";
import { verifyOtpCode } from "@/lib/otp-store";
import { ServiceError } from "@/lib/service";
import { serialiseSession, sessionCookieOptions } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = (await readJson(request)) as { email?: string; otpCode?: string };
    const email = body.email?.trim().toLowerCase();
    const otpCode = body.otpCode?.trim();

    if (!email) {
      throw new ServiceError("Please enter your registered email address", 400);
    }

    // Verify 4-digit OTP code
    if (!otpCode || !verifyOtpCode(email, otpCode)) {
      throw new ServiceError("Invalid or expired 4-digit code. Please check your email inbox and try again.", 401);
    }

    const db = getDb();
    const user = await db.getUserByEmail(email);
    if (!user) {
      throw new ServiceError(
        "No organisation is registered with that email address",
        404,
      );
    }

    const organisation = await db.getOrganisationByUserId(user.id);
    if (!organisation) {
      throw new ServiceError("That account has no organisation profile", 409);
    }

    const response = NextResponse.json({ user, organisation });
    response.cookies.set({
      ...sessionCookieOptions,
      value: serialiseSession(user.id),
    });
    return response;
  } catch (error) {
    return apiError(error);
  }
}
