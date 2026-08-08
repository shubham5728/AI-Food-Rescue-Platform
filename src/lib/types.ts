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

/**
 * The full rescue lifecycle. `matched` is the moment a recipient accepts;
 * everything after it tracks the physical handover, which is where donations
 * actually go wrong in the field.
 */
export type DonationStatus =
  | "available"
  | "matched"
  | "pickup_scheduled"
  | "pickup_assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "completed"
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

  /** Meals that expired unclaimed — the counterfactual the platform exists to shrink. */
  meals_lost: number;
  /** Delivered as a share of everything that reached a terminal state, 0-100. */
  rescue_success_rate: number;
  active_donors: number;
  active_recipients: number;
}

/** How well the AI layer is actually performing, not just how much it ran. */
export interface AiPerformanceStats {
  /** Donations where at least one viable recipient was found, 0-100. */
  match_coverage: number;
  /** Share of accepted donations that went to the AI's top-ranked recipient, 0-100. */
  top_pick_acceptance: number;
  /** Mean match score of accepted donations. */
  average_accepted_score: number;
  /** Donations flagged HIGH risk that were nevertheless delivered, 0-100. */
  high_risk_save_rate: number;
  /** Mean recipients removed by hard constraints per analysed donation. */
  average_filtered_out: number;
  analysed_donations: number;
  /** Split between LLM-written and engine-written explanations. */
  explained_by_llm: number;
  explained_by_engine: number;
}

/* -------------------------------------------------------------------------- */
/* Pickup verification                                                        */
/* -------------------------------------------------------------------------- */

/**
 * A one-time code proving the right people met. Issued when a pickup is
 * assigned, redeemed at the donor's door, and again on delivery — so a
 * donation cannot be marked collected by someone who was never there.
 */
export interface PickupVerification {
  donation_id: string;
  /** 6-digit code read out at the door. */
  code: string;
  /** Payload encoded into the QR the collector scans. */
  qr_payload: string;
  stage: "collection" | "delivery";
  issued_at: string;
  expires_at: string;
  verified_at: string | null;
  attempts: number;
}

/* -------------------------------------------------------------------------- */
/* AI feature outputs                                                         */
/* -------------------------------------------------------------------------- */

/** Forecast of surplus a donor is likely to have in an upcoming window. */
export interface SurplusForecast {
  organisation_id: string;
  organisation_name: string;
  /** 0-100 chance this donor produces surplus in the window. */
  probability: number;
  /** Expected meals, with a range because a point estimate would be false precision. */
  expected_meals: number;
  meals_low: number;
  meals_high: number;
  /** When the surplus is most likely to appear. */
  window_start: string;
  window_end: string;
  /** Predicted waste risk if that surplus is posted and left unclaimed. */
  projected_waste_risk: number;
  confidence: "low" | "medium" | "high";
  /** How many past donations the forecast is built from. */
  sample_size: number;
  reasons: string[];
}

/** One recipient's share when a donation is split across several. */
export interface AllocationSlice {
  recipient_id: string;
  recipient_name: string;
  meals: number;
  match_score: number;
  distance_km: number;
  reason: string;
}

/** Result of splitting a donation that no single recipient can absorb. */
export interface AllocationPlan {
  donation_id: string;
  total_meals: number;
  allocated_meals: number;
  leftover_meals: number;
  slices: AllocationSlice[];
  explanation: string;
  /** True when one recipient can take everything — no split needed. */
  single_recipient: boolean;
}

/** A stop on an optimised collection run. */
export interface RouteStop {
  donation_id: string;
  label: string;
  latitude: number;
  longitude: number;
  /** Cumulative driving minutes from the start of the run. */
  eta_minutes: number;
  leg_km: number;
  meals: number;
  deadline: string;
  /** Minutes of slack at arrival; negative means the deadline is missed. */
  slack_minutes: number;
}

export interface RoutePlan {
  stops: RouteStop[];
  total_km: number;
  total_minutes: number;
  /** Stops the route cannot reach before their deadline. */
  missed: string[];
  /** Distance saved versus collecting in the order the donations arrived. */
  saved_km: number;
}

/** A cluster of unmet demand, used to show where to focus. */
export interface DemandHotspot {
  latitude: number;
  longitude: number;
  label: string;
  /** Meals of unmet capacity in this cluster. */
  unmet_meals: number;
  recipients: number;
  intensity: number;
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
