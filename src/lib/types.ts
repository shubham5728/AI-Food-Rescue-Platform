/**
 * Domain model for FoodBridge AI.
 *
 * These types are the contract between the data layer (Supabase or the
 * in-memory demo store), the AI pipeline, and the UI. Everything is plain
 * JSON-serialisable so rows can cross the server/client boundary untouched.
 */

export type UserRole = "donor" | "recipient";

export type OrganisationType =
  | "restaurant"
  | "hostel"
  | "event"
  | "catering"
  | "shelter"
  | "ngo"
  | "community_kitchen"
  | "food_bank"
  | "care_home";

/** What the food itself is, which drives shelf life and recipient affinity. */
export type FoodCategory =
  | "cooked_meal"
  | "bakery"
  | "produce"
  | "dairy"
  | "packaged"
  | "beverage"
  | "dry_goods";

export type DietaryType = "vegetarian" | "vegan" | "non_vegetarian";

export type QuantityUnit = "meals" | "kg" | "litres" | "packets" | "trays";

export type DonationStatus =
  | "available"
  | "matched"
  | "pickup_scheduled"
  | "picked_up"
  | "delivered"
  | "cancelled";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/** Where the numbers on screen came from — surfaced in the UI for honesty. */
export type AiSource = "openai" | "engine";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Organisation {
  id: string;
  user_id: string;
  name: string;
  type: OrganisationType;
  role: UserRole;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  verified: boolean;

  /** Recipient-only fields. Null/empty for donors. */
  capacity_min: number | null;
  capacity_max: number | null;
  typical_quantity: number | null;
  /** Diets the organisation is able to accept. */
  dietary_requirements: DietaryType[];
  /** Food categories accepted. Empty array means "no restriction". */
  accepted_food_types: FoodCategory[];
  /** Allergens the organisation cannot take at all. */
  excluded_allergens: string[];
  /** How far the organisation will travel to collect, in km. */
  pickup_radius_km: number | null;
  can_pickup: boolean;
  /** Minutes the organisation needs to mobilise a collection run. */
  pickup_lead_time_min: number | null;
  /**
   * Share of accepted pickups this organisation has actually completed, 0–1.
   * Feeds the match score so a reliable collector outranks a flaky one.
   */
  reliability: number;

  created_at: string;
}

export interface Donation {
  id: string;
  donor_id: string;
  food_name: string;
  food_type: FoodCategory;
  quantity: number;
  quantity_unit: QuantityUnit;
  meals: number;
  /** Estimated mass of food rescued, used by the impact dashboard. */
  weight_kg: number;
  dietary_type: DietaryType;
  allergens: string[];
  prepared_at: string;
  pickup_start: string;
  pickup_deadline: string;
  latitude: number;
  longitude: number;
  address: string;
  notes: string | null;
  image_url: string | null;

  status: DonationStatus;
  /** Set once a recipient accepts. */
  matched_recipient_id: string | null;

  waste_risk_score: number;
  waste_risk_level: RiskLevel;
  waste_risk_reasons: string[];
  waste_risk_explanation: string;

  priority_score: number;
  priority_level: PriorityLevel;
  priority_reason: string;

  ai_source: AiSource;
  analysed_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  donation_id: string;
  recipient_id: string;
  match_score: number;
  explanation: string;
  /** Short checklist bullets rendered next to the score. */
  reasons: string[];
  rank: number;
  distance_km: number;
  /** Minutes of slack between the earliest possible pickup and the deadline. */
  time_buffer_min: number;
  ai_source: AiSource;
  created_at: string;
}

export interface DonationStatusHistory {
  id: string;
  donation_id: string;
  status: DonationStatus;
  note: string | null;
  created_at: string;
}

/** A recipient that failed a hard constraint, kept so the UI can explain why. */
export interface RejectedCandidate {
  recipient_id: string;
  recipient_name: string;
  reason: string;
}

export interface MatchWithRecipient extends Match {
  recipient: Organisation;
}

export interface DonationWithRelations extends Donation {
  donor: Organisation;
  matched_recipient: Organisation | null;
  matches: MatchWithRecipient[];
  history: DonationStatusHistory[];
}

export interface ImpactStats {
  meals_donated: number;
  food_saved_kg: number;
  donations_completed: number;
  people_served: number;
  meals_at_risk: number;
  active_donations: number;
  high_risk_donations: number;
}

export interface ImpactTimePoint {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  label: string;
  meals: number;
  kg: number;
  completed: number;
  at_risk: number;
}
