import "dotenv/config";
import { buildSeed } from "../src/lib/db/seed";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

async function main() {
  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  console.log("Seeding SQLite database...");
  const seed = buildSeed(new Date());

  // Clear existing data
  await prisma.donationStatusHistory.deleteMany();
  await prisma.match.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.organisation.deleteMany();
  await prisma.user.deleteMany();

  // Insert users
  for (const u of seed.users) {
    await prisma.user.create({
      data: {
        id: u.id,
        email: u.email,
        role: u.role,
        created_at: new Date(u.created_at),
      },
    });
  }

  // Insert orgs
  for (const o of seed.organisations) {
    await prisma.organisation.create({
      data: {
        id: o.id,
        user_id: o.user_id,
        name: o.name,
        type: o.type,
        role: o.role,
        contact_person: o.contact_person,
        phone: o.phone,
        email: o.email,
        address: o.address,
        latitude: o.latitude,
        longitude: o.longitude,
        verified: o.verified,
        capacity_min: o.capacity_min,
        capacity_max: o.capacity_max,
        typical_quantity: o.typical_quantity,
        dietary_requirements: JSON.stringify(o.dietary_requirements),
        accepted_food_types: JSON.stringify(o.accepted_food_types),
        excluded_allergens: JSON.stringify(o.excluded_allergens),
        pickup_radius_km: o.pickup_radius_km,
        can_pickup: o.can_pickup,
        pickup_lead_time_min: o.pickup_lead_time_min,
        reliability: o.reliability,
        created_at: new Date(o.created_at),
      },
    });
  }

  // Insert donations
  for (const d of seed.donations) {
    await prisma.donation.create({
      data: {
        id: d.id,
        donor_id: d.donor_id,
        food_name: d.food_name,
        food_type: d.food_type,
        quantity: d.quantity,
        quantity_unit: d.quantity_unit,
        meals: d.meals,
        weight_kg: d.weight_kg,
        dietary_type: d.dietary_type,
        allergens: JSON.stringify(d.allergens),
        prepared_at: d.prepared_at,
        pickup_start: d.pickup_start,
        pickup_deadline: d.pickup_deadline,
        latitude: d.latitude,
        longitude: d.longitude,
        address: d.address,
        notes: d.notes,
        image_url: d.image_url,
        status: d.status,
        matched_recipient_id: d.matched_recipient_id,
        waste_risk_score: d.waste_risk_score,
        waste_risk_level: d.waste_risk_level,
        waste_risk_reasons: JSON.stringify(d.waste_risk_reasons),
        waste_risk_explanation: d.waste_risk_explanation,
        priority_score: d.priority_score,
        priority_level: d.priority_level,
        priority_reason: d.priority_reason,
        ai_source: d.ai_source,
        analysed_at: d.analysed_at,
        created_at: new Date(d.created_at),
        updated_at: new Date(d.updated_at),
      },
    });
  }

  for (const h of seed.history) {
    await prisma.donationStatusHistory.create({
      data: {
        id: h.id,
        donation_id: h.donation_id,
        status: h.status,
        note: h.note,
        created_at: new Date(h.created_at),
      },
    });
  }

  console.log("Seeding complete!");
}

main().catch(console.error);
