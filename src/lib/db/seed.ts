import { KG_PER_MEAL } from "@/lib/constants";
import type {
  Donation,
  DonationStatusHistory,
  Organisation,
  User,
} from "@/lib/types";

/**
 * Demo dataset.
 *
 * Two things here are deliberate rather than arbitrary:
 *
 * 1. Every timestamp is derived from "now", so the demo scenario reproduces
 *    whatever time of day the app is opened. A donation seeded with a fixed
 *    2:00 PM deadline is uninteresting at 6:00 PM.
 * 2. The 48 completed donations sum to exactly 1,200 meals, so accepting and
 *    delivering the 50-meal demo donation moves the dashboard to 1,250.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Green Leaf Restaurant, Indiranagar, Bangalore — the demo origin point. */
const GREEN_LEAF = { lat: 12.9784, lon: 77.6408 };

/** Deterministic LCG so the seed is identical on every boot. */
function makeRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Scales a list of positive integers so it sums to exactly `target`, putting
 * any rounding remainder on the largest element.
 */
function distributeExact(values: number[], target: number): number[] {
  const sum = values.reduce((a, b) => a + b, 0);
  const scaled = values.map((v) => Math.max(1, Math.round((v * target) / sum)));
  let diff = target - scaled.reduce((a, b) => a + b, 0);
  while (diff !== 0) {
    let idx = 0;
    for (let i = 1; i < scaled.length; i++) {
      if (diff > 0 ? scaled[i] > scaled[idx] : scaled[i] > scaled[idx] + 1) idx = i;
    }
    const step = diff > 0 ? 1 : -1;
    scaled[idx] += step;
    diff -= step;
  }
  return scaled;
}

interface OrgSpec extends Omit<Organisation, "user_id" | "created_at"> {}

function donorOrg(
  id: string,
  name: string,
  type: Organisation["type"],
  contact: string,
  phone: string,
  email: string,
  address: string,
  latitude: number,
  longitude: number,
  verified = true,
): OrgSpec {
  return {
    id,
    name,
    type,
    role: "donor",
    contact_person: contact,
    phone,
    email,
    address,
    latitude,
    longitude,
    verified,
    capacity_min: null,
    capacity_max: null,
    typical_quantity: null,
    dietary_requirements: [],
    accepted_food_types: [],
    excluded_allergens: [],
    pickup_radius_km: null,
    can_pickup: false,
    pickup_lead_time_min: null,
    reliability: 0.9,
  };
}

const DONORS: OrgSpec[] = [
  donorOrg(
    "org_green_leaf",
    "Green Leaf Restaurant",
    "restaurant",
    "Anita Rao",
    "+91 98450 11223",
    "kitchen@greenleaf.demo",
    "412, 100 Feet Road, Indiranagar, Bangalore 560038",
    GREEN_LEAF.lat,
    GREEN_LEAF.lon,
  ),
  donorOrg(
    "org_spice_route",
    "Spice Route Catering",
    "catering",
    "Faizal Ahmed",
    "+91 98860 44551",
    "ops@spiceroute.demo",
    "18, Old Airport Road, Domlur, Bangalore 560071",
    12.9612,
    77.6387,
  ),
  donorOrg(
    "org_sunrise_hostel",
    "Sunrise Student Hostel",
    "hostel",
    "Meera Nair",
    "+91 99001 78234",
    "warden@sunrisehostel.demo",
    "9th Cross, Koramangala 5th Block, Bangalore 560095",
    12.9345,
    77.6265,
  ),
  donorOrg(
    "org_bloom_events",
    "Bloom Events",
    "event",
    "Rajesh Kumar",
    "+91 97400 63398",
    "hello@bloomevents.demo",
    "Palace Grounds, Jayamahal, Bangalore 560006",
    13.0098,
    77.5921,
  ),
];

const RECIPIENTS: OrgSpec[] = [
  /* --- The three that clear every hard constraint in the demo ---------- */
  {
    id: "org_hope_kitchen",
    name: "Hope Community Kitchen",
    type: "community_kitchen",
    role: "recipient",
    contact_person: "Sister Grace Thomas",
    phone: "+91 98801 33445",
    email: "coordinator@hopekitchen.demo",
    address: "24, 1st Main, Domlur Layout, Bangalore 560071",
    latitude: 12.9584,
    longitude: 77.6198,
    verified: true,
    capacity_min: 50,
    capacity_max: 100,
    typical_quantity: 50,
    dietary_requirements: ["vegetarian"],
    accepted_food_types: ["cooked_meal", "bakery", "produce", "dairy"],
    excluded_allergens: [],
    pickup_radius_km: 8,
    can_pickup: true,
    pickup_lead_time_min: 20,
    reliability: 0.97,
  },
  {
    id: "org_community_food_centre",
    name: "Community Food Centre",
    type: "ngo",
    role: "recipient",
    contact_person: "Vikram Shetty",
    phone: "+91 99012 55667",
    email: "intake@cfcentre.demo",
    address: "56, Cunningham Road, Vasanth Nagar, Bangalore 560052",
    latitude: 13.0084,
    longitude: 77.5968,
    verified: true,
    capacity_min: 30,
    capacity_max: 150,
    typical_quantity: 70,
    dietary_requirements: ["vegetarian", "non_vegetarian"],
    accepted_food_types: ["cooked_meal", "packaged", "produce", "bakery"],
    excluded_allergens: [],
    pickup_radius_km: 10,
    can_pickup: true,
    pickup_lead_time_min: 40,
    reliability: 0.91,
  },
  {
    id: "org_care_foundation",
    name: "Care Foundation",
    type: "care_home",
    role: "recipient",
    contact_person: "Lakshmi Iyer",
    phone: "+91 98452 77889",
    email: "office@carefoundation.demo",
    address: "31, 4th Block, Jayanagar, Bangalore 560011",
    latitude: 12.9234,
    longitude: 77.5808,
    verified: true,
    capacity_min: 20,
    capacity_max: 60,
    typical_quantity: 30,
    dietary_requirements: ["vegetarian", "vegan"],
    accepted_food_types: ["produce", "dairy", "cooked_meal", "bakery"],
    excluded_allergens: ["shellfish"],
    pickup_radius_km: 12,
    can_pickup: true,
    pickup_lead_time_min: 50,
    reliability: 0.84,
  },

  /* --- Each of these fails a different hard constraint ------------------ */
  {
    id: "org_little_wings",
    name: "Little Wings Care Home",
    type: "care_home",
    role: "recipient",
    contact_person: "Joseph D'Souza",
    phone: "+91 98860 12309",
    email: "care@littlewings.demo",
    address: "7, Ulsoor Lake Road, Ulsoor, Bangalore 560008",
    latitude: 12.9812,
    longitude: 77.6205,
    verified: true,
    capacity_min: 10,
    capacity_max: 25,
    typical_quantity: 18,
    dietary_requirements: ["vegetarian"],
    accepted_food_types: ["cooked_meal", "dairy"],
    excluded_allergens: ["nuts"],
    pickup_radius_km: 6,
    can_pickup: true,
    pickup_lead_time_min: 30,
    reliability: 0.88,
  },
  {
    id: "org_northside_bank",
    name: "Northside Food Bank",
    type: "food_bank",
    role: "recipient",
    contact_person: "Priya Menon",
    phone: "+91 99456 88220",
    email: "logistics@northsidebank.demo",
    address: "Yelahanka New Town, Bangalore 560064",
    latitude: 13.1007,
    longitude: 77.5963,
    verified: true,
    capacity_min: 100,
    capacity_max: 600,
    typical_quantity: 250,
    dietary_requirements: ["vegetarian", "non_vegetarian"],
    accepted_food_types: ["packaged", "dry_goods", "cooked_meal"],
    excluded_allergens: [],
    pickup_radius_km: 9,
    can_pickup: true,
    pickup_lead_time_min: 60,
    reliability: 0.93,
  },
  {
    id: "org_eastview_shelter",
    name: "Eastview Night Shelter",
    type: "shelter",
    role: "recipient",
    contact_person: "Arun Prakash",
    phone: "+91 97390 44112",
    email: "night@eastview.demo",
    address: "Whitefield Main Road, Bangalore 560066",
    latitude: 12.9698,
    longitude: 77.7499,
    verified: true,
    capacity_min: 40,
    capacity_max: 120,
    typical_quantity: 60,
    dietary_requirements: ["vegetarian", "non_vegetarian"],
    accepted_food_types: ["cooked_meal", "packaged"],
    excluded_allergens: [],
    pickup_radius_km: 20,
    can_pickup: true,
    pickup_lead_time_min: 90,
    reliability: 0.79,
  },
  {
    id: "org_anna_dry_goods",
    name: "Anna Dry Goods Bank",
    type: "food_bank",
    role: "recipient",
    contact_person: "Sudha Reddy",
    phone: "+91 98453 10982",
    email: "store@annabank.demo",
    address: "Shivajinagar, Bangalore 560051",
    latitude: 12.9862,
    longitude: 77.6047,
    verified: true,
    capacity_min: 50,
    capacity_max: 400,
    typical_quantity: 150,
    dietary_requirements: ["vegetarian", "non_vegetarian"],
    accepted_food_types: ["dry_goods", "packaged"],
    excluded_allergens: [],
    pickup_radius_km: 15,
    can_pickup: true,
    pickup_lead_time_min: 45,
    reliability: 0.9,
  },
  {
    id: "org_nourish_trust",
    name: "Nourish Trust",
    type: "ngo",
    role: "recipient",
    contact_person: "Deepak Sharma",
    phone: "+91 90080 22114",
    email: "contact@nourishtrust.demo",
    address: "HAL 2nd Stage, Indiranagar, Bangalore 560008",
    latitude: 12.9721,
    longitude: 77.6389,
    verified: false,
    capacity_min: 30,
    capacity_max: 120,
    typical_quantity: 55,
    dietary_requirements: ["vegetarian", "non_vegetarian"],
    accepted_food_types: ["cooked_meal", "bakery"],
    excluded_allergens: [],
    pickup_radius_km: 10,
    can_pickup: true,
    pickup_lead_time_min: 25,
    reliability: 0.61,
  },
];

const ALL_ORG_SPECS = [...DONORS, ...RECIPIENTS];

/** Historical food names, rotated across the completed-donation history. */
const HISTORY_FOODS: {
  name: string;
  type: Donation["food_type"];
  diet: Donation["dietary_type"];
  unit: Donation["quantity_unit"];
}[] = [
  { name: "Vegetable Pulao", type: "cooked_meal", diet: "vegetarian", unit: "meals" },
  { name: "Sambar & Rice", type: "cooked_meal", diet: "vegetarian", unit: "meals" },
  { name: "Chapati & Dal", type: "cooked_meal", diet: "vegetarian", unit: "meals" },
  { name: "Assorted Breads", type: "bakery", diet: "vegetarian", unit: "trays" },
  { name: "Mixed Vegetable Crates", type: "produce", diet: "vegan", unit: "kg" },
  { name: "Curd & Buttermilk", type: "dairy", diet: "vegetarian", unit: "litres" },
  { name: "Chicken Biryani", type: "cooked_meal", diet: "non_vegetarian", unit: "meals" },
  { name: "Idli & Chutney", type: "cooked_meal", diet: "vegetarian", unit: "meals" },
  { name: "Packaged Snack Boxes", type: "packaged", diet: "vegetarian", unit: "packets" },
  { name: "Fruit Assortment", type: "produce", diet: "vegan", unit: "kg" },
  { name: "Upma & Fruit", type: "cooked_meal", diet: "vegetarian", unit: "meals" },
  { name: "Paneer Curry & Rice", type: "cooked_meal", diet: "vegetarian", unit: "meals" },
];

const HISTORY_PAIRS: [string, string][] = [
  ["org_green_leaf", "org_hope_kitchen"],
  ["org_spice_route", "org_community_food_centre"],
  ["org_sunrise_hostel", "org_care_foundation"],
  ["org_bloom_events", "org_hope_kitchen"],
  ["org_green_leaf", "org_community_food_centre"],
  ["org_spice_route", "org_northside_bank"],
  ["org_sunrise_hostel", "org_hope_kitchen"],
  ["org_bloom_events", "org_eastview_shelter"],
];

const HISTORY_COUNT = 48;
const HISTORY_TOTAL_MEALS = 1200;
const HISTORY_TOTAL_KG = 850;
const HISTORY_SPAN_DAYS = 90;

function blankAi(): Pick<
  Donation,
  | "waste_risk_score"
  | "waste_risk_level"
  | "waste_risk_reasons"
  | "waste_risk_explanation"
  | "priority_score"
  | "priority_level"
  | "priority_reason"
  | "ai_source"
  | "analysed_at"
> {
  return {
    waste_risk_score: 0,
    waste_risk_level: "LOW",
    waste_risk_reasons: [],
    waste_risk_explanation: "",
    priority_score: 0,
    priority_level: "LOW",
    priority_reason: "",
    ai_source: "engine",
    analysed_at: null,
  };
}

/** Completed donations that make up the platform's existing impact record. */
function buildHistory(now: Date): {
  donations: Donation[];
  history: DonationStatusHistory[];
} {
  const rand = makeRandom(20260808);
  const rawMeals = Array.from({ length: HISTORY_COUNT }, () =>
    Math.round(12 + rand() * 34),
  );
  const meals = distributeExact(rawMeals, HISTORY_TOTAL_MEALS);

  const rawKg = meals.map((m) => Math.round(m * KG_PER_MEAL * (0.9 + rand() * 0.25)));
  const kg = distributeExact(rawKg, HISTORY_TOTAL_KG);

  const donations: Donation[] = [];
  const history: DonationStatusHistory[] = [];

  for (let i = 0; i < HISTORY_COUNT; i++) {
    const food = HISTORY_FOODS[i % HISTORY_FOODS.length];
    const [donorId, recipientId] = HISTORY_PAIRS[i % HISTORY_PAIRS.length];
    const donor = ALL_ORG_SPECS.find((o) => o.id === donorId)!;

    // Spread evenly backwards from two days ago across the reporting window.
    const daysAgo = 2 + Math.round((i / HISTORY_COUNT) * (HISTORY_SPAN_DAYS - 2));
    const base = now.getTime() - daysAgo * DAY;
    const preparedAt = new Date(base - 3 * HOUR);
    const pickupStart = new Date(base - 2 * HOUR);
    const deadline = new Date(base);
    const delivered = new Date(base - 30 * MINUTE);

    const id = `don_h${String(i + 1).padStart(2, "0")}`;
    const quantity =
      food.unit === "meals" ? meals[i] : Math.max(1, Math.round(kg[i]));

    donations.push({
      id,
      donor_id: donorId,
      food_name: food.name,
      food_type: food.type,
      quantity,
      quantity_unit: food.unit,
      meals: meals[i],
      weight_kg: kg[i],
      dietary_type: food.diet,
      allergens: [],
      prepared_at: preparedAt.toISOString(),
      pickup_start: pickupStart.toISOString(),
      pickup_deadline: deadline.toISOString(),
      latitude: donor.latitude,
      longitude: donor.longitude,
      address: donor.address,
      notes: null,
      status: "delivered",
      matched_recipient_id: recipientId,
      ...blankAi(),
      priority_reason: "Delivered — no further action needed.",
      created_at: new Date(base - 5 * HOUR).toISOString(),
      updated_at: delivered.toISOString(),
    });

    const steps: Donation["status"][] = [
      "available",
      "matched",
      "pickup_scheduled",
      "picked_up",
      "delivered",
    ];
    steps.forEach((status, step) => {
      history.push({
        id: `hist_${id}_${step}`,
        donation_id: id,
        status,
        note: null,
        created_at: new Date(
          base - 5 * HOUR + step * 68 * MINUTE,
        ).toISOString(),
      });
    });
  }

  return { donations, history };
}

interface ActiveSpec {
  id: string;
  donor_id: string;
  food_name: string;
  food_type: Donation["food_type"];
  quantity: number;
  quantity_unit: Donation["quantity_unit"];
  meals: number;
  dietary_type: Donation["dietary_type"];
  allergens: string[];
  preparedMinutesAgo: number;
  startMinutesFromNow: number;
  deadlineMinutesFromNow: number;
  status: Donation["status"];
  matched_recipient_id: string | null;
  notes: string | null;
}

/**
 * Live donations spanning the lifecycle, so the dashboard is populated before
 * the judge creates anything. The demo donation is deliberately NOT seeded —
 * step 2 of the demo is creating it.
 */
const ACTIVE_SPECS: ActiveSpec[] = [
  {
    id: "don_a01",
    donor_id: "org_green_leaf",
    food_name: "Paneer Butter Masala & Naan",
    food_type: "cooked_meal",
    quantity: 35,
    quantity_unit: "meals",
    meals: 35,
    dietary_type: "vegetarian",
    allergens: ["dairy", "gluten"],
    preparedMinutesAgo: 95,
    startMinutesFromNow: -30,
    deadlineMinutesFromNow: 45,
    status: "available",
    matched_recipient_id: null,
    notes: "Buffet surplus from the lunch service. Packed in foil trays.",
  },
  {
    id: "don_a02",
    donor_id: "org_bloom_events",
    food_name: "Wedding Buffet Surplus",
    food_type: "cooked_meal",
    quantity: 120,
    quantity_unit: "meals",
    meals: 120,
    dietary_type: "vegetarian",
    allergens: ["dairy", "nuts"],
    preparedMinutesAgo: 70,
    startMinutesFromNow: 0,
    deadlineMinutesFromNow: 175,
    status: "available",
    matched_recipient_id: null,
    notes: "Large volume — recipient must bring their own transport.",
  },
  {
    id: "don_a03",
    donor_id: "org_spice_route",
    food_name: "Mixed Biryani Trays",
    food_type: "cooked_meal",
    quantity: 16,
    quantity_unit: "trays",
    meals: 80,
    dietary_type: "non_vegetarian",
    allergens: [],
    preparedMinutesAgo: 40,
    startMinutesFromNow: 15,
    deadlineMinutesFromNow: 240,
    status: "available",
    matched_recipient_id: null,
    notes: null,
  },
  {
    id: "don_a04",
    donor_id: "org_sunrise_hostel",
    food_name: "Breakfast Upma & Fruit",
    food_type: "cooked_meal",
    quantity: 40,
    quantity_unit: "meals",
    meals: 40,
    dietary_type: "vegetarian",
    allergens: [],
    preparedMinutesAgo: 55,
    startMinutesFromNow: -20,
    deadlineMinutesFromNow: 120,
    status: "matched",
    matched_recipient_id: "org_hope_kitchen",
    notes: "Mess surplus. Collect from the rear service gate.",
  },
  {
    id: "don_a05",
    donor_id: "org_green_leaf",
    food_name: "Assorted Bakery Items",
    food_type: "bakery",
    quantity: 6,
    quantity_unit: "trays",
    meals: 25,
    dietary_type: "vegetarian",
    allergens: ["gluten", "eggs"],
    preparedMinutesAgo: 180,
    startMinutesFromNow: -60,
    deadlineMinutesFromNow: 480,
    status: "pickup_scheduled",
    matched_recipient_id: "org_community_food_centre",
    notes: null,
  },
  {
    id: "don_a06",
    donor_id: "org_spice_route",
    food_name: "Fresh Produce Crates",
    food_type: "produce",
    quantity: 45,
    quantity_unit: "kg",
    meals: 60,
    dietary_type: "vegan",
    allergens: [],
    preparedMinutesAgo: 300,
    startMinutesFromNow: -120,
    deadlineMinutesFromNow: 1200,
    status: "available",
    matched_recipient_id: null,
    notes: "Over-ordered for a cancelled event. Cold-stored.",
  },
  {
    id: "don_a07",
    donor_id: "org_sunrise_hostel",
    food_name: "Dinner Dal & Rice",
    food_type: "cooked_meal",
    quantity: 45,
    quantity_unit: "meals",
    meals: 45,
    dietary_type: "vegetarian",
    allergens: [],
    preparedMinutesAgo: 110,
    startMinutesFromNow: -75,
    deadlineMinutesFromNow: 90,
    status: "picked_up",
    matched_recipient_id: "org_care_foundation",
    notes: null,
  },
];

function buildActive(now: Date): {
  donations: Donation[];
  history: DonationStatusHistory[];
} {
  const donations: Donation[] = [];
  const history: DonationStatusHistory[] = [];
  const flow: Donation["status"][] = [
    "available",
    "matched",
    "pickup_scheduled",
    "picked_up",
    "delivered",
  ];

  for (const spec of ACTIVE_SPECS) {
    const donor = ALL_ORG_SPECS.find((o) => o.id === spec.donor_id)!;
    const created = new Date(now.getTime() - spec.preparedMinutesAgo * MINUTE + 5 * MINUTE);

    donations.push({
      id: spec.id,
      donor_id: spec.donor_id,
      food_name: spec.food_name,
      food_type: spec.food_type,
      quantity: spec.quantity,
      quantity_unit: spec.quantity_unit,
      meals: spec.meals,
      weight_kg: Math.round(spec.meals * KG_PER_MEAL),
      dietary_type: spec.dietary_type,
      allergens: spec.allergens,
      prepared_at: new Date(now.getTime() - spec.preparedMinutesAgo * MINUTE).toISOString(),
      pickup_start: new Date(now.getTime() + spec.startMinutesFromNow * MINUTE).toISOString(),
      pickup_deadline: new Date(
        now.getTime() + spec.deadlineMinutesFromNow * MINUTE,
      ).toISOString(),
      latitude: donor.latitude,
      longitude: donor.longitude,
      address: donor.address,
      notes: spec.notes,
      status: spec.status,
      matched_recipient_id: spec.matched_recipient_id,
      ...blankAi(),
      created_at: created.toISOString(),
      updated_at: created.toISOString(),
    });

    const reached = flow.indexOf(spec.status);
    for (let step = 0; step <= reached; step++) {
      history.push({
        id: `hist_${spec.id}_${step}`,
        donation_id: spec.id,
        status: flow[step],
        note: null,
        created_at: new Date(created.getTime() + step * 22 * MINUTE).toISOString(),
      });
    }
  }

  return { donations, history };
}

export interface SeedData {
  users: User[];
  organisations: Organisation[];
  donations: Donation[];
  history: DonationStatusHistory[];
}

export function buildSeed(now: Date = new Date()): SeedData {
  const createdAt = new Date(now.getTime() - 120 * DAY).toISOString();

  const users: User[] = ALL_ORG_SPECS.map((org) => ({
    id: org.id.replace("org_", "usr_"),
    email: org.email,
    role: org.role,
    created_at: createdAt,
  }));

  const organisations: Organisation[] = ALL_ORG_SPECS.map((org) => ({
    ...org,
    user_id: org.id.replace("org_", "usr_"),
    created_at: createdAt,
  }));

  const past = buildHistory(now);
  const active = buildActive(now);

  return {
    users,
    organisations,
    donations: [...past.donations, ...active.donations],
    history: [...past.history, ...active.history],
  };
}

/** Accounts offered as one-click logins on the sign-in screen. */
export const DEMO_ACCOUNTS = [
  {
    email: "kitchen@greenleaf.demo",
    name: "Green Leaf Restaurant",
    role: "donor" as const,
    blurb: "Restaurant with surplus lunch service food",
  },
  {
    email: "coordinator@hopekitchen.demo",
    name: "Hope Community Kitchen",
    role: "recipient" as const,
    blurb: "Community kitchen, 50–100 meals, vegetarian",
  },
  {
    email: "intake@cfcentre.demo",
    name: "Community Food Centre",
    role: "recipient" as const,
    blurb: "NGO, 30–150 meals, any diet",
  },
  {
    email: "ops@spiceroute.demo",
    name: "Spice Route Catering",
    role: "donor" as const,
    blurb: "Caterer with event surplus",
  },
];
