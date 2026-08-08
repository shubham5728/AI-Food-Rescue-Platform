import type {
  DietaryType,
  DonationStatus,
  PickupVerification,
  FoodCategory,
  OrganisationType,
  PriorityLevel,
  QuantityUnit,
  RiskLevel,
} from "./types";

/**
 * Safe holding time in minutes from preparation before the food should be
 * treated as spoiled. Cooked meals held at ambient temperature are the tight
 * constraint the platform exists to solve; packaged goods are effectively
 * unbounded on the timescale of a pickup window.
 */
export const SHELF_LIFE_MINUTES: Record<FoodCategory, number> = {
  cooked_meal: 240,
  bakery: 720,
  produce: 2880,
  dairy: 480,
  packaged: 10080,
  beverage: 4320,
  dry_goods: 20160,
};

/** Rough mass per served meal, used when a donor enters quantity in meals. */
export const KG_PER_MEAL = 0.7;

/** Meals one person is served in a single distribution. */
export const MEALS_PER_PERSON = 2;

/**
 * Smallest share worth allocating to a recipient. Below this the collection
 * trip costs more than the food is worth, so the split refuses to go finer.
 */
export const MIN_ALLOCATION_SLICE_MEALS = 10;

/**
 * Real-world logistics floor: even a perfectly matched pickup needs someone to
 * be told, mobilise, drive, and load. Time remaining below this is effectively
 * zero usable time, which is why the risk curve treats it as the origin.
 */
export const PICKUP_LOGISTICS_FLOOR_MIN = 40;

/** Average urban driving speed used to turn distance into travel minutes. */
export const AVERAGE_SPEED_KMH = 22;

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  cooked_meal: "Cooked meals",
  bakery: "Bakery",
  produce: "Fresh produce",
  dairy: "Dairy",
  packaged: "Packaged food",
  beverage: "Beverages",
  dry_goods: "Dry goods",
};

export const DIETARY_LABELS: Record<DietaryType, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  non_vegetarian: "Non-vegetarian",
};

export const ORGANISATION_TYPE_LABELS: Record<OrganisationType, string> = {
  restaurant: "Restaurant",
  hostel: "Hostel",
  event: "Event organiser",
  catering: "Catering company",
  shelter: "Shelter",
  ngo: "NGO",
  community_kitchen: "Community kitchen",
  food_bank: "Food bank",
  care_home: "Community care organisation",
};

export const DONOR_TYPES: OrganisationType[] = [
  "restaurant",
  "hostel",
  "event",
  "catering",
];

export const RECIPIENT_TYPES: OrganisationType[] = [
  "shelter",
  "ngo",
  "community_kitchen",
  "food_bank",
  "care_home",
];

export const QUANTITY_UNIT_LABELS: Record<QuantityUnit, string> = {
  meals: "meals",
  kg: "kg",
  litres: "litres",
  packets: "packets",
  trays: "trays",
};

export const STATUS_LABELS: Record<DonationStatus, string> = {
  available: "Available",
  matched: "Accepted",
  pickup_scheduled: "Pickup Scheduled",
  pickup_assigned: "Pickup Assigned",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** The happy-path lifecycle, in order. Cancelled sits outside the chain. */
export const STATUS_FLOW: DonationStatus[] = [
  "available",
  "matched",
  "pickup_scheduled",
  "pickup_assigned",
  "picked_up",
  "in_transit",
  "delivered",
  "completed",
];

/**
 * Which statuses a donation may legally move to from its current one.
 *
 * Backwards steps exist deliberately: a collector who arrives and finds the
 * food already gone needs a way to release it, and a run that falls through
 * should return to the queue rather than sit in a dead state.
 */
export const STATUS_TRANSITIONS: Record<DonationStatus, DonationStatus[]> = {
  available: ["matched", "cancelled"],
  matched: ["pickup_scheduled", "available", "cancelled"],
  pickup_scheduled: ["pickup_assigned", "matched", "cancelled"],
  pickup_assigned: ["picked_up", "pickup_scheduled", "cancelled"],
  picked_up: ["in_transit", "delivered", "cancelled"],
  in_transit: ["delivered", "cancelled"],
  delivered: ["completed"],
  completed: [],
  cancelled: [],
};

/**
 * Steps that require a one-time code to be redeemed first. Collection is
 * verified at the donor's door, delivery at the recipient's.
 */
export const VERIFIED_TRANSITIONS: Partial<
  Record<DonationStatus, PickupVerification["stage"]>
> = {
  picked_up: "collection",
  delivered: "delivery",
};

/** Statuses that count as a successful rescue for impact purposes. */
export const RESCUED_STATUSES: DonationStatus[] = ["delivered", "completed"];

/** Statuses where the donation is finished, successfully or not. */
export const TERMINAL_STATUSES: DonationStatus[] = [
  "delivered",
  "completed",
  "cancelled",
];

export const RISK_THRESHOLDS: { level: RiskLevel; min: number }[] = [
  { level: "HIGH", min: 70 },
  { level: "MEDIUM", min: 40 },
  { level: "LOW", min: 0 },
];

export const PRIORITY_THRESHOLDS: { level: PriorityLevel; min: number }[] = [
  { level: "CRITICAL", min: 85 },
  { level: "HIGH", min: 65 },
  { level: "MEDIUM", min: 40 },
  { level: "LOW", min: 0 },
];

export const COMMON_ALLERGENS = [
  "dairy",
  "nuts",
  "peanuts",
  "gluten",
  "soy",
  "eggs",
  "shellfish",
  "fish",
  "sesame",
];

export function riskLevelFor(score: number): RiskLevel {
  return RISK_THRESHOLDS.find((t) => score >= t.min)?.level ?? "LOW";
}

export function priorityLevelFor(score: number): PriorityLevel {
  return PRIORITY_THRESHOLDS.find((t) => score >= t.min)?.level ?? "LOW";
}
