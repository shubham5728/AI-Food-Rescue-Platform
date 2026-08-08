import { PrismaClient } from "../../../generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import type {
  Donation,
  DonationStatusHistory,
  Match,
  Organisation,
  User,
} from "@/lib/types"
import { type DonationFilter, matchesFilter, type Repository } from "./repository"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  (function () {
    const url = process.env.DATABASE_URL || "file:./dev.db"
    const adapter = new PrismaBetterSqlite3({ url })
    return new PrismaClient({ adapter })
  })()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export class PrismaRepository implements Repository {
  readonly kind = "sqlite" as any

  async getUserById(id: string): Promise<User | null> {
    const u = await prisma.user.findUnique({ where: { id } })
    if (!u) return null
    return { ...u, created_at: u.created_at.toISOString() } as User
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const u = await prisma.user.findUnique({ where: { email } })
    if (!u) return null
    return { ...u, created_at: u.created_at.toISOString() } as User
  }

  async createUser(user: User): Promise<User> {
    const u = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: new Date(user.created_at),
      },
    })
    return { ...u, created_at: u.created_at.toISOString() } as User
  }

  async getOrganisationById(id: string): Promise<Organisation | null> {
    const o = await prisma.organisation.findUnique({ where: { id } })
    return o ? this.mapOrganisation(o) : null
  }

  async getOrganisationByUserId(userId: string): Promise<Organisation | null> {
    const o = await prisma.organisation.findFirst({ where: { user_id: userId } })
    return o ? this.mapOrganisation(o) : null
  }

  async listOrganisations(role?: Organisation["role"]): Promise<Organisation[]> {
    const os = await prisma.organisation.findMany({
      where: role ? { role } : undefined,
    })
    return os.map(this.mapOrganisation)
  }

  async createOrganisation(org: Organisation): Promise<Organisation> {
    const o = await prisma.organisation.create({
      data: {
        id: org.id,
        user_id: org.user_id,
        name: org.name,
        type: org.type,
        role: org.role,
        contact_person: org.contact_person,
        phone: org.phone,
        email: org.email,
        address: org.address,
        latitude: org.latitude,
        longitude: org.longitude,
        verified: org.verified,
        capacity_min: org.capacity_min,
        capacity_max: org.capacity_max,
        typical_quantity: org.typical_quantity,
        dietary_requirements: JSON.stringify(org.dietary_requirements),
        accepted_food_types: JSON.stringify(org.accepted_food_types),
        excluded_allergens: JSON.stringify(org.excluded_allergens),
        pickup_radius_km: org.pickup_radius_km,
        can_pickup: org.can_pickup,
        pickup_lead_time_min: org.pickup_lead_time_min,
        reliability: org.reliability,
        created_at: new Date(org.created_at),
      },
    })
    return this.mapOrganisation(o)
  }

  async createDonation(donation: Donation): Promise<Donation> {
    const d = await prisma.donation.create({
      data: {
        id: donation.id,
        donor_id: donation.donor_id,
        food_name: donation.food_name,
        food_type: donation.food_type,
        quantity: donation.quantity,
        quantity_unit: donation.quantity_unit,
        meals: donation.meals,
        weight_kg: donation.weight_kg,
        dietary_type: donation.dietary_type,
        allergens: JSON.stringify(donation.allergens),
        prepared_at: donation.prepared_at,
        pickup_start: donation.pickup_start,
        pickup_deadline: donation.pickup_deadline,
        latitude: donation.latitude,
        longitude: donation.longitude,
        address: donation.address,
        notes: donation.notes,
        status: donation.status,
        matched_recipient_id: donation.matched_recipient_id,
        waste_risk_score: donation.waste_risk_score,
        waste_risk_level: donation.waste_risk_level,
        waste_risk_reasons: JSON.stringify(donation.waste_risk_reasons),
        waste_risk_explanation: donation.waste_risk_explanation,
        priority_score: donation.priority_score,
        priority_level: donation.priority_level,
        priority_reason: donation.priority_reason,
        ai_source: donation.ai_source,
        analysed_at: donation.analysed_at,
        created_at: new Date(donation.created_at),
        updated_at: new Date(donation.updated_at),
      },
    })
    return this.mapDonation(d)
  }

  async getDonationById(id: string): Promise<Donation | null> {
    const d = await prisma.donation.findUnique({ where: { id } })
    return d ? this.mapDonation(d) : null
  }

  async updateDonation(id: string, patch: Partial<Donation>): Promise<Donation> {
    const data: any = { ...patch }
    if (patch.allergens !== undefined) data.allergens = JSON.stringify(patch.allergens)
    if (patch.waste_risk_reasons !== undefined) data.waste_risk_reasons = JSON.stringify(patch.waste_risk_reasons)
    if (patch.created_at !== undefined) data.created_at = new Date(patch.created_at)
    if (patch.updated_at !== undefined) data.updated_at = new Date(patch.updated_at)

    const d = await prisma.donation.update({
      where: { id },
      data,
    })
    return this.mapDonation(d)
  }

  async listDonations(filter?: DonationFilter): Promise<Donation[]> {
    const ds = await prisma.donation.findMany({
      orderBy: { created_at: "desc" },
    })
    const mapped = ds.map(this.mapDonation)
    return mapped.filter((d) => matchesFilter(d, filter))
  }

  async replaceMatches(donationId: string, matches: Match[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.match.deleteMany({ where: { donation_id: donationId } })
      if (matches.length > 0) {
        await tx.match.createMany({
          data: matches.map((m) => ({
            id: m.id,
            donation_id: m.donation_id,
            recipient_id: m.recipient_id,
            match_score: m.match_score,
            explanation: m.explanation,
            reasons: JSON.stringify(m.reasons),
            rank: m.rank,
            distance_km: m.distance_km,
            time_buffer_min: m.time_buffer_min,
            ai_source: m.ai_source,
            created_at: new Date(m.created_at),
          })),
        })
      }
    })
  }

  async listMatches(donationId: string): Promise<Match[]> {
    const ms = await prisma.match.findMany({
      where: { donation_id: donationId },
      orderBy: { rank: "asc" },
    })
    return ms.map(this.mapMatch)
  }

  async listMatchesForRecipient(recipientId: string): Promise<Match[]> {
    const ms = await prisma.match.findMany({
      where: { recipient_id: recipientId },
      orderBy: { rank: "asc" },
    })
    return ms.map(this.mapMatch)
  }

  async appendHistory(entry: DonationStatusHistory): Promise<void> {
    await prisma.donationStatusHistory.create({
      data: {
        id: entry.id,
        donation_id: entry.donation_id,
        status: entry.status,
        note: entry.note,
        created_at: new Date(entry.created_at),
      },
    })
  }

  async listHistory(donationId: string): Promise<DonationStatusHistory[]> {
    const hs = await prisma.donationStatusHistory.findMany({
      where: { donation_id: donationId },
      orderBy: { created_at: "desc" },
    })
    return hs.map((h) => ({
      ...h,
      created_at: h.created_at.toISOString(),
    } as DonationStatusHistory))
  }

  // --- Mappers ---

  private mapOrganisation = (o: any): Organisation => ({
    ...o,
    dietary_requirements: JSON.parse(o.dietary_requirements),
    accepted_food_types: JSON.parse(o.accepted_food_types),
    excluded_allergens: JSON.parse(o.excluded_allergens),
    created_at: o.created_at.toISOString(),
  })

  private mapDonation = (d: any): Donation => ({
    ...d,
    allergens: JSON.parse(d.allergens),
    waste_risk_reasons: JSON.parse(d.waste_risk_reasons),
    created_at: d.created_at.toISOString(),
    updated_at: d.updated_at.toISOString(),
  })

  private mapMatch = (m: any): Match => ({
    ...m,
    reasons: JSON.parse(m.reasons),
    created_at: m.created_at.toISOString(),
  })
}
