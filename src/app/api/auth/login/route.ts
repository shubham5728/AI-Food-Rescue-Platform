import { NextResponse } from "next/server";

import { apiError, readJson } from "@/lib/api";
import { getDb } from "@/lib/db";
import { ServiceError } from "@/lib/service";
import { serialiseSession, sessionCookieOptions } from "@/lib/session";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { email } = loginSchema.parse(await readJson(request));

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
