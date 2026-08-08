import { NextResponse } from "next/server";

import { apiError, readJson } from "@/lib/api";
import { getDb } from "@/lib/db";
import { serialiseSession, sessionCookieOptions } from "@/lib/session";
import type { Organisation, User } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await readJson(request)) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    const db = getDb();
    let user = await db.getUserByEmail(email);
    let organisation = user ? await db.getOrganisationByUserId(user.id) : null;

    // If user or organisation does not exist yet (New Login), auto-create a profile!
    if (!user || !organisation) {
      const orgName = email.split("@")[0].replace(/[._-]/g, " ").toUpperCase() + " Organisation";
      const userId = `usr_${Date.now()}`;
      const orgId = `org_${Date.now()}`;

      const newUser: User = {
        id: userId,
        email,
        role: "donor",
        created_at: new Date().toISOString(),
      };
      user = await db.createUser(newUser);

      const newOrg: Organisation = {
        id: orgId,
        user_id: user.id,
        name: `${orgName} (Ahmedabad)`,
        type: "restaurant",
        role: "donor",
        contact_person: orgName,
        phone: "+91 98765 43210",
        email,
        address: "S.G. Highway, Ahmedabad",
        latitude: 23.0350,
        longitude: 72.5450,
        pickup_radius_km: 10,
        verified: true,
        capacity_min: null,
        capacity_max: null,
        typical_quantity: null,
        dietary_requirements: ["vegetarian"],
        accepted_food_types: ["cooked_meal", "packaged"],
        excluded_allergens: [],
        can_pickup: true,
        pickup_lead_time_min: 30,
        reliability: 0.95,
        created_at: new Date().toISOString(),
      };
      organisation = await db.createOrganisation(newOrg);
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
