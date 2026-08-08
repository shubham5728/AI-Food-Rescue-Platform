import { NextResponse } from "next/server";

import { apiError, readJson } from "@/lib/api";
import { getDb } from "@/lib/db";
import { ServiceError } from "@/lib/service";
import { serialiseSession, sessionCookieOptions } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = (await readJson(request)) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      throw new ServiceError("Please enter your email address", 400);
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
