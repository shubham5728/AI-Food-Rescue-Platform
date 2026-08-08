import { KG_PER_MEAL } from "@/lib/constants";
import type {
  Donation,
  DonationStatusHistory,
  Organisation,
  User,
} from "@/lib/types";

/**
 * Real Ahmedabad Demo Dataset.
 *
 * All coordinates, organisations, and food rescue records are centered in
 * Ahmedabad, Gujarat (around 23.0225° N, 72.5714° E).
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Agashiye - The House of MG, Lal Darwaja, Ahmedabad — the demo origin point. */
const AHMEDABAD_CENTER = { lat: 23.0258, lon: 72.5804 };

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
    reliability: 0.95,
  };
}

const DONORS: OrgSpec[] = [
  donorOrg(
    "org_agashiye",
    "Agashiye - House of MG",
    "restaurant",
    "Anand Patel",
    "+91 98250 12345",
    "kitchen@agashiye.demo",
    "Opposite Sidi Saiyyed Mosque, Lal Darwaja, Ahmedabad, Gujarat 380001",
    AHMEDABAD_CENTER.lat,
    AHMEDABAD_CENTER.lon,
  ),
  donorOrg(
    "org_tgb_catering",
    "The Grand Bhagwati (TGB)",
    "catering",
    "Jignesh Shah",
    "+91 98795 67890",
    "ops@tgbcatering.demo",
    "S.G. Highway, Bodakdev, Ahmedabad, Gujarat 380054",
    23.0450,
    72.5120,
  ),
  donorOrg(
    "org_havmor_navrangpura",
    "Havmor Restaurant",
    "restaurant",
    "Rushabh Mehta",
    "+91 99241 23456",
    "manager@havmor.demo",
    "CG Road, Navrangpura, Ahmedabad, Gujarat 380009",
    23.0360,
    72.5610,
  ),
  donorOrg(
    "org_marriott_ahmedabad",
    "Courtyard by Marriott",
    "event",
    "Hardik Joshi",
    "+91 97129 34567",
    "banquets@marriottahmedabad.demo",
    "Ramdev Nagar, Satellite, Ahmedabad, Gujarat 380015",
    23.0275,
    72.5170,
  ),
  donorOrg(
    "org_rajwadu_dining",
    "Rajwadu Traditional Dining",
    "restaurant",
    "Vikram Parmar",
    "+91 98980 45678",
    "food@rajwadu.demo",
    "Near Malhar Party Plot, Vejalpur, Ahmedabad, Gujarat 380051",
    23.0030,
    72.5280,
  ),
];

const RECIPIENTS: OrgSpec[] = [
  {
    id: "org_robin_hood_ahmedabad",
    name: "Robin Hood Army Ahmedabad",
    type: "community_kitchen",
    role: "recipient",
    contact_person: "Pooja Trivedi",
    phone: "+91 98240 54321",
    email: "ahmedabad@robinhoodarmy.demo",
    address: "Bodakdev & SG Highway Circle, Ahmedabad, Gujarat 380054",
    latitude: 23.0390,
    longitude: 72.5110,
    verified: true,
    capacity_min: 40,
    capacity_max: 200,
    typical_quantity: 80,
    dietary_requirements: ["vegetarian"],
    accepted_food_types: ["cooked_meal", "bakery", "produce", "dairy"],
    excluded_allergens: [],
    pickup_radius_km: 12,
    can_pickup: true,
    pickup_lead_time_min: 20,
    reliability: 0.98,
  },
  {
    id: "org_akshaya_patra_ahmedabad",
    name: "Akshaya Patra Foundation",
    type: "ngo",
    role: "recipient",
    contact_person: "Rakesh Sharma",
    phone: "+91 98981 11223",
    email: "ahmedabad@akshayapatra.demo",
    address: "Bhadaj Circle, S.G. Highway, Ahmedabad, Gujarat 380060",
    latitude: 23.0850,
    longitude: 72.5020,
    verified: true,
    capacity_min: 50,
    capacity_max: 400,
    typical_quantity: 150,
    dietary_requirements: ["vegetarian"],
    accepted_food_types: ["cooked_meal", "packaged", "produce", "dry_goods"],
    excluded_allergens: [],
    pickup_radius_km: 15,
    can_pickup: true,
    pickup_lead_time_min: 30,
    reliability: 0.96,
  },
  {
    id: "org_manav_sadhna",
    name: "Manav Sadhna (Sabarmati)",
    type: "care_home",
    role: "recipient",
    contact_person: "Jayesh Patel",
    phone: "+91 98251 33445",
    email: "kitchen@manavsadhna.demo",
    address: "Gandhi Ashram, Sabarmati, Ahmedabad, Gujarat 380027",
    latitude: 23.0600,
    longitude: 72.5800,
    verified: true,
    capacity_min: 25,
    capacity_max: 100,
    typical_quantity: 50,
    dietary_requirements: ["vegetarian", "vegan"],
    accepted_food_types: ["produce", "dairy", "cooked_meal", "bakery"],
    excluded_allergens: [],
    pickup_radius_km: 10,
    can_pickup: true,
    pickup_lead_time_min: 25,
    reliability: 0.93,
  },
  {
    id: "org_annamrita_iskcon",
    name: "Annamrita ISKCON Food Bank",
    type: "food_bank",
    role: "recipient",
    contact_person: "Gaurav Das",
    phone: "+91 99099 87654",
    email: "food@annamrita.demo",
    address: "Near ISKCON Temple, Satellite, Ahmedabad, Gujarat 380015",
    latitude: 23.0285,
    longitude: 72.5075,
    verified: true,
    capacity_min: 30,
    capacity_max: 150,
    typical_quantity: 75,
    dietary_requirements: ["vegetarian"],
    accepted_food_types: ["cooked_meal", "packaged", "dry_goods"],
    excluded_allergens: [],
    pickup_radius_km: 10,
    can_pickup: true,
    pickup_lead_time_min: 35,
    reliability: 0.91,
  },
  {
    id: "org_blind_people_assoc",
    name: "Blind People's Association (BPA)",
    type: "care_home",
    role: "recipient",
    contact_person: "Dr. Bhushan Punani",
    phone: "+91 98240 19283",
    email: "intake@bpagujarat.demo",
    address: "Jagdish Patel Chowk, Vastrapur, Ahmedabad, Gujarat 380015",
    latitude: 23.0350,
    longitude: 72.5290,
    verified: true,
    capacity_min: 20,
    capacity_max: 80,
    typical_quantity: 40,
    dietary_requirements: ["vegetarian"],
    accepted_food_types: ["cooked_meal", "dairy", "bakery"],
    excluded_allergens: ["nuts"],
    pickup_radius_km: 8,
    can_pickup: true,
    pickup_lead_time_min: 30,
    reliability: 0.89,
  },
  {
    id: "org_apang_manav_mandal",
    name: "Apang Manav Mandal Hostel",
    type: "shelter",
    role: "recipient",
    contact_person: "Chetna Patel",
    phone: "+91 98790 11223",
    email: "care@apangmanav.demo",
    address: "University Road, Navrangpura, Ahmedabad, Gujarat 380009",
    latitude: 23.0340,
    longitude: 72.5480,
    verified: true,
    capacity_min: 15,
    capacity_max: 60,
    typical_quantity: 35,
    dietary_requirements: ["vegetarian"],
    accepted_food_types: ["cooked_meal", "dairy"],
    excluded_allergens: [],
    pickup_radius_km: 6,
    can_pickup: true,
    pickup_lead_time_min: 20,
    reliability: 0.9,
  },
  {
    id: "org_seva_yajna_samiti",
    name: "Seva Yajna Samiti",
    type: "community_kitchen",
    role: "recipient",
    contact_person: "Mahesh Shah",
    phone: "+91 98254 99887",
    email: "seva@hospitalyajna.demo",
    address: "Near Civil Hospital, Asarwa, Ahmedabad, Gujarat 380016",
    latitude: 23.0480,
    longitude: 72.6020,
    verified: true,
    capacity_min: 50,
    capacity_max: 300,
    typical_quantity: 100,
    dietary_requirements: ["vegetarian"],
    accepted_food_types: ["cooked_meal", "packaged"],
    excluded_allergens: [],
    pickup_radius_km: 15,
    can_pickup: true,
    pickup_lead_time_min: 40,
    reliability: 0.94,
  },
  {
    id: "org_kadam_step_forward",
    name: "Kadam Step Forward NGO",
    type: "ngo",
    role: "recipient",
    contact_person: "Sanjay Solanki",
    phone: "+91 97234 55667",
    email: "contact@kadamngo.demo",
    address: "Maninagar East, Ahmedabad, Gujarat 380008",
    latitude: 22.9970,
    longitude: 72.6000,
    verified: false,
    capacity_min: 20,
    capacity_max: 70,
    typical_quantity: 35,
    dietary_requirements: ["vegetarian"],
    accepted_food_types: ["cooked_meal", "bakery"],
    excluded_allergens: [],
    pickup_radius_km: 8,
    can_pickup: true,
    pickup_lead_time_min: 30,
    reliability: 0.65,
  },
];

const ALL_ORG_SPECS = [...DONORS, ...RECIPIENTS];

/** Historical food items in Ahmedabad. */
const HISTORY_FOODS: {
  name: string;
  type: Donation["food_type"];
  diet: Donation["dietary_type"];
  unit: Donation["quantity_unit"];
  image: string;
}[] = [
  { name: "Gujarati Special Thali (Rotli, Shaak, Dal, Rice)", type: "cooked_meal", diet: "vegetarian", unit: "meals", image: "/food-gujarati-thali.png" },
  { name: "Kathiyawadi Meals (Sev Tameta, Bajra Roti)", type: "cooked_meal", diet: "vegetarian", unit: "meals", image: "/food-kathiyawadi.png" },
  { name: "Dal Dhokli & Jeera Rice", type: "cooked_meal", diet: "vegetarian", unit: "meals", image: "/food-dal-dhokli.png" },
  { name: "Fresh Khaman Dhokla & Farsan Boxes", type: "bakery", diet: "vegetarian", unit: "trays", image: "/food-dhokla-farsan.png" },
  { name: "Fresh Produce Crates (Vegetables)", type: "produce", diet: "vegan", unit: "kg", image: "/food-produce.png" },
  { name: "Fresh Buttermilk (Chaas) Jars", type: "dairy", diet: "vegetarian", unit: "litres", image: "/food-chaas.png" },
  { name: "Paneer Butter Masala & Naan Trays", type: "cooked_meal", diet: "vegetarian", unit: "meals", image: "/food-paneer-naan.png" },
  { name: "Puri Bhaji & Shrikhand Combo", type: "cooked_meal", diet: "vegetarian", unit: "meals", image: "/food-puri-bhaji.png" },
  { name: "Packaged Snack Packets", type: "packaged", diet: "vegetarian", unit: "packets", image: "/food-snacks.png" },
  { name: "Fresh Mango & Fruit Bowls", type: "produce", diet: "vegan", unit: "kg", image: "/food-produce.png" },
  { name: "Khichdi & Kadhi Buffet Surplus", type: "cooked_meal", diet: "vegetarian", unit: "meals", image: "/food-dal-dhokli.png" },
];

const HISTORY_PAIRS: [string, string][] = [
  ["org_agashiye", "org_robin_hood_ahmedabad"],
  ["org_tgb_catering", "org_akshaya_patra_ahmedabad"],
  ["org_havmor_navrangpura", "org_manav_sadhna"],
  ["org_marriott_ahmedabad", "org_annamrita_iskcon"],
  ["org_rajwadu_dining", "org_blind_people_assoc"],
  ["org_agashiye", "org_apang_manav_mandal"],
  ["org_tgb_catering", "org_seva_yajna_samiti"],
  ["org_havmor_navrangpura", "org_robin_hood_ahmedabad"],
];

const HISTORY_COUNT = 48;
const HISTORY_TOTAL_MEALS = 1650;
const HISTORY_TOTAL_KG = 1155;
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
    Math.round(15 + rand() * 40),
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
      image_url: food.image,
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
  image: string;
}

const ACTIVE_SPECS: ActiveSpec[] = [
  {
    id: "don_a01",
    donor_id: "org_agashiye",
    food_name: "Gujarati Thali Surplus (50 Meals)",
    food_type: "cooked_meal",
    quantity: 50,
    quantity_unit: "meals",
    meals: 50,
    dietary_type: "vegetarian",
    allergens: ["dairy"],
    preparedMinutesAgo: 90,
    startMinutesFromNow: -20,
    deadlineMinutesFromNow: 60,
    status: "available",
    matched_recipient_id: null,
    notes: "Fresh lunch thali surplus in stainless containers. Ready at Lal Darwaja.",
    image: "/food-gujarati-thali.png",
  },
  {
    id: "don_a02",
    donor_id: "org_tgb_catering",
    food_name: "Wedding Buffet Surplus (120 Meals)",
    food_type: "cooked_meal",
    quantity: 120,
    quantity_unit: "meals",
    meals: 120,
    dietary_type: "vegetarian",
    allergens: ["dairy", "nuts"],
    preparedMinutesAgo: 60,
    startMinutesFromNow: 0,
    deadlineMinutesFromNow: 180,
    status: "available",
    matched_recipient_id: null,
    notes: "SG Highway banquets. Needs vehicle transport.",
    image: "/food-wedding-buffet.png",
  },
  {
    id: "don_a03",
    donor_id: "org_havmor_navrangpura",
    food_name: "Paneer Masala & Naan Trays",
    food_type: "cooked_meal",
    quantity: 15,
    quantity_unit: "trays",
    meals: 75,
    dietary_type: "vegetarian",
    allergens: ["dairy", "gluten"],
    preparedMinutesAgo: 45,
    startMinutesFromNow: 10,
    deadlineMinutesFromNow: 210,
    status: "available",
    matched_recipient_id: null,
    notes: "Hot packed in thermal foil trays.",
    image: "/food-paneer-naan.png",
  },
  {
    id: "don_a04",
    donor_id: "org_marriott_ahmedabad",
    food_name: "Breakfast Upma & Dhokla",
    food_type: "cooked_meal",
    quantity: 45,
    quantity_unit: "meals",
    meals: 45,
    dietary_type: "vegetarian",
    allergens: ["mustard"],
    preparedMinutesAgo: 50,
    startMinutesFromNow: -15,
    deadlineMinutesFromNow: 110,
    status: "matched",
    matched_recipient_id: "org_robin_hood_ahmedabad",
    notes: "Satellite hotel kitchen. Collect at gate #2.",
    image: "/food-upma-dhokla.png",
  },
  {
    id: "don_a05",
    donor_id: "org_agashiye",
    food_name: "Assorted Farsan & Bakery Trays",
    food_type: "bakery",
    quantity: 8,
    quantity_unit: "trays",
    meals: 30,
    dietary_type: "vegetarian",
    allergens: ["gluten"],
    preparedMinutesAgo: 150,
    startMinutesFromNow: -45,
    deadlineMinutesFromNow: 420,
    status: "pickup_scheduled",
    matched_recipient_id: "org_manav_sadhna",
    notes: null,
    image: "/food-dhokla-farsan.png",
  },
  {
    id: "don_a06",
    donor_id: "org_rajwadu_dining",
    food_name: "Fresh Vegetable Crates (40 kg)",
    food_type: "produce",
    quantity: 40,
    quantity_unit: "kg",
    meals: 55,
    dietary_type: "vegan",
    allergens: [],
    preparedMinutesAgo: 240,
    startMinutesFromNow: -90,
    deadlineMinutesFromNow: 900,
    status: "available",
    matched_recipient_id: null,
    notes: "Vejalpur kitchen. Freshly washed produce.",
    image: "/food-produce.png",
  },
  {
    id: "don_a07",
    donor_id: "org_havmor_navrangpura",
    food_name: "Dal Rice & Kadhi Trays",
    food_type: "cooked_meal",
    quantity: 50,
    quantity_unit: "meals",
    meals: 50,
    dietary_type: "vegetarian",
    allergens: ["dairy"],
    preparedMinutesAgo: 100,
    startMinutesFromNow: -60,
    deadlineMinutesFromNow: 80,
    status: "picked_up",
    matched_recipient_id: "org_blind_people_assoc",
    notes: null,
    image: "/food-dal-dhokli.png",
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
      image_url: spec.image,
      status: spec.status,
      matched_recipient_id: spec.matched_recipient_id,
      ...blankAi(),
      created_at: created.toISOString(),
      updated_at: created.toISOString(),
    });

    const reached = flow.indexOf(spec.status);
    for (let step = 0; step <= reached; step++) {
      const status = flow[step];
      history.push({
        id: `hist_${spec.id}_${step}`,
        donation_id: spec.id,
        status,
        note: status === spec.status ? "Status initialized" : null,
        created_at: new Date(
          created.getTime() + step * 15 * MINUTE,
        ).toISOString(),
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
    email: "kitchen@agashiye.demo",
    name: "Agashiye - House of MG",
    role: "donor" as const,
    blurb: "Heritage Restaurant at Lal Darwaja with surplus lunch thali",
  },
  {
    email: "ahmedabad@robinhoodarmy.demo",
    name: "Robin Hood Army Ahmedabad",
    role: "recipient" as const,
    blurb: "NGO Community Kitchen, 40–200 meals, Bodakdev / SG Highway",
  },
  {
    email: "ahmedabad@akshayapatra.demo",
    name: "Akshaya Patra Foundation",
    role: "recipient" as const,
    blurb: "Food Foundation, 50–400 meals, Bhadaj / SG Highway",
  },
  {
    email: "ops@tgbcatering.demo",
    name: "The Grand Bhagwati (TGB)",
    role: "donor" as const,
    blurb: "Catering & Banquets with wedding surplus",
  },
];
