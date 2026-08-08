/**
 * Calibration harness for the deterministic scoring engine.
 *
 * Run with `npm run calibrate`. It replays the demo scenario from the brief
 * against the real engine so the published numbers can be checked without
 * clicking through the UI, and prints the factor breakdown behind each score.
 */
import { applyHardConstraints } from "../src/lib/ai/constraints";
import { rankCandidates } from "../src/lib/ai/match";
import { narrateMatch, narrateWasteRisk } from "../src/lib/ai/narrate";
import { assessPriority } from "../src/lib/ai/priority";
import { assessWasteRisk } from "../src/lib/ai/risk";
import { KG_PER_MEAL } from "../src/lib/constants";
import { buildSeed } from "../src/lib/db/seed";
import type { Donation } from "../src/lib/types";

const MINUTE = 60_000;

const now = new Date();
const seed = buildSeed(now);
const donorOrg = seed.organisations.find((o) => o.id === "org_agashiye")!;
const recipients = seed.organisations.filter((o) => o.role === "recipient");

/** Step 2 of the demo: 50 vegetarian meals, prepared 1h ago, 90 min window. */
const demoDonation: Donation = {
  id: "don_demo",
  donor_id: donorOrg.id,
  food_name: "Vegetable Rice",
  food_type: "cooked_meal",
  quantity: 50,
  quantity_unit: "meals",
  meals: 50,
  weight_kg: Math.round(50 * KG_PER_MEAL),
  dietary_type: "vegetarian",
  allergens: [],
  prepared_at: new Date(now.getTime() - 60 * MINUTE).toISOString(),
  pickup_start: new Date(now.getTime() - 10 * MINUTE).toISOString(),
  pickup_deadline: new Date(now.getTime() + 90 * MINUTE).toISOString(),
  latitude: donorOrg.latitude,
  longitude: donorOrg.longitude,
  address: donorOrg.address,
  notes: null,
  status: "available",
  matched_recipient_id: null,
  waste_risk_score: 0,
  waste_risk_level: "LOW",
  waste_risk_reasons: [],
  waste_risk_explanation: "",
  priority_score: 0,
  priority_level: "LOW",
  priority_reason: "",
  ai_source: "engine",
  analysed_at: null,
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
};

const line = (n = 74) => console.log("-".repeat(n));

const { viable, rejected } = applyHardConstraints(demoDonation, recipients, now);
const matches = rankCandidates(demoDonation, viable);
const risk = assessWasteRisk(demoDonation, viable.length, now);
const priority = assessPriority(
  demoDonation,
  risk.score,
  risk.minutes_remaining,
  matches.length > 0 ? matches[0].score : null,
);

console.log("\nDEMO SCENARIO — 50 vegetarian meals, 90 minutes to deadline");
line();

console.log(`\nSTEP 1  Hard constraints: ${viable.length} viable, ${rejected.length} ruled out`);
for (const r of rejected) console.log(`   x ${r.recipient_name.padEnd(28)} ${r.reason}`);

console.log(`\nSTEP 2  Waste risk: ${risk.score}/100  (${risk.level})   [target ~87 HIGH]`);
for (const f of risk.factors) {
  console.log(
    `   ${f.label.padEnd(20)} value ${f.value.toFixed(3)}  ${String(f.points).padStart(3)} pts   ${f.detail}`,
  );
}
console.log(`\n   ${narrateWasteRisk(demoDonation, risk)}`);

console.log(`\nSTEP 3  Recipient matching   [targets 94 / 84 / 79]`);
matches.forEach((m, i) => {
  console.log(`\n   #${i + 1} ${m.recipient.name} — ${m.score}%`);
  for (const f of m.factors) {
    console.log(
      `      ${f.label.padEnd(24)} value ${f.value.toFixed(3)}  ${String(f.points).padStart(3)} pts`,
    );
  }
  console.log(`      > ${narrateMatch(demoDonation, m, i === 0)}`);
});

console.log(
  `\nSTEP 4  Pickup priority: ${priority.score}/100 (${priority.level})   [target ~96 CRITICAL]`,
);
console.log(`   ${priority.reason}`);

line();

const totals = seed.donations
  .filter((d) => d.status === "delivered")
  .reduce(
    (acc, d) => ({
      meals: acc.meals + d.meals,
      kg: acc.kg + d.weight_kg,
      count: acc.count + 1,
    }),
    { meals: 0, kg: 0, count: 0 },
  );

console.log(
  `\nSEED IMPACT BASELINE  ${totals.meals} meals / ${totals.kg} kg / ${totals.count} completed` +
    `   [targets 1650 / 1155 / 48]`,
);
console.log(
  `AFTER THE DEMO DELIVERY  ${totals.meals + 50} meals / ${totals.kg + demoDonation.weight_kg} kg / ${totals.count + 1} completed\n`,
);

/**
 * The five rejections must stay distinct: the whole point of showing them is
 * that a recipient can fail for reasons that have nothing to do with score.
 */
const rejectionKinds = new Set(
  rejected.map((r) =>
    /Capacity/.test(r.reason) ? "capacity"
    : /outside their/.test(r.reason) ? "distance"
    : /deadline is sooner|holding time/.test(r.reason) ? "timing"
    : /Does not accept/.test(r.reason) ? "food type"
    : /not verified/.test(r.reason) ? "verification"
    : "other",
  ),
);

const checks: [string, boolean, string][] = [
  ["waste risk 84-90 HIGH", risk.score >= 84 && risk.score <= 90, `${risk.score}`],
  ["priority 92-98 CRITICAL", priority.score >= 92 && priority.score <= 98, `${priority.score}`],
  ["3 viable recipients", viable.length === 3, `${viable.length}`],
  ["5 ruled out by hard constraints", rejected.length === 5, `${rejected.length}`],
  [
    "each rejection a different reason",
    rejectionKinds.size === 5,
    [...rejectionKinds].join(", "),
  ],
  [
    "top match is Manav Sadhna",
    matches[0]?.recipient.id === "org_manav_sadhna",
    matches[0]?.recipient.name ?? "none",
  ],
  ["top match 91-97", matches[0]?.score >= 91 && matches[0]?.score <= 97, `${matches[0]?.score}`],
  ["second match 81-87", matches[1]?.score >= 81 && matches[1]?.score <= 87, `${matches[1]?.score}`],
  ["third match 76-82", matches[2]?.score >= 76 && matches[2]?.score <= 82, `${matches[2]?.score}`],
  ["baseline 1650 meals", totals.meals === 1650, `${totals.meals}`],
  ["baseline 1155 kg", totals.kg === 1155, `${totals.kg}`],
  ["baseline 48 completed", totals.count === 48, `${totals.count}`],
];

let failed = 0;
for (const [label, ok, actual] of checks) {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label.padEnd(36)} ${actual}`);
}
console.log("");
process.exit(failed > 0 ? 1 : 0);
