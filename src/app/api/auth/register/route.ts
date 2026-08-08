import { NextResponse } from "next/server";

import { apiError, readJson } from "@/lib/api";
import { getDb } from "@/lib/db";
import { ServiceError } from "@/lib/service";
import { serialiseSession, sessionCookieOptions } from "@/lib/session";
import type { Organisation, User } from "@/lib/types";
import { newId } from "@/lib/utils";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await readJson(request));
    const db = getDb();

    if (await db.getUserByEmail(input.email)) {
      throw new ServiceError(
        "An organisation is already registered with that email address",
        409,
      );
    }

    const now = new Date().toISOString();

    const user: User = {
      id: newId("usr"),
      email: input.email,
      role: input.role,
      created_at: now,
    };

    const isRecipient = input.role === "recipient";

    const organisation: Organisation = {
      id: newId("org"),
      user_id: user.id,
      name: input.name,
      type: input.type as Organisation["type"],
      role: input.role,
      contact_person: input.contact_person,
      phone: input.phone,
      email: input.email,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      // New organisations start unverified: an unverified recipient is filtered
      // out by the hard constraints, which is exactly the intended behaviour.
      verified: false,
      capacity_min: isRecipient ? input.capacity_min : null,
      capacity_max: isRecipient ? input.capacity_max : null,
      typical_quantity: isRecipient ? input.typical_quantity : null,
      dietary_requirements: isRecipient ? input.dietary_requirements : [],
      accepted_food_types: isRecipient ? input.accepted_food_types : [],
      excluded_allergens: isRecipient ? input.excluded_allergens : [],
      pickup_radius_km: isRecipient ? input.pickup_radius_km : null,
      can_pickup: isRecipient ? input.can_pickup : false,
      pickup_lead_time_min: isRecipient ? input.pickup_lead_time_min : null,
      reliability: 0.8,
      created_at: now,
    };

    await db.createUser(user);
    await db.createOrganisation(organisation);

    const response = NextResponse.json({ user, organisation }, { status: 201 });
    response.cookies.set({
      ...sessionCookieOptions,
      value: serialiseSession(user.id),
    });
    return response;
  } catch (error) {
    return apiError(error);
  }
}
