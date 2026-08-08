/**
 * End-to-end verification of the demo scenario against a running server.
 *
 *   npm run build && npx next start -p 3210
 *   node scripts/verify-demo.mjs http://localhost:3210
 *
 * It drives the real HTTP API exactly as the UI does — sign in, create the
 * donation, accept it as the recipient, walk the lifecycle to Delivered — and
 * asserts the numbers the demo depends on, including the 1,200 -> 1,250 move
 * on the impact dashboard.
 */

const BASE = process.argv[2] ?? "http://localhost:3210";

const MINUTE = 60_000;
let cookie = "";
let failures = 0;

function check(label, ok, actual) {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label.padEnd(44)} ${actual}`);
}

async function call(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
      ...(options.headers ?? {}),
    },
  });

  const setCookie = response.headers.getSetCookie?.() ?? [];
  for (const entry of setCookie) {
    if (entry.startsWith("foodbridge_session=")) cookie = entry.split(";")[0];
  }

  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(
      `${options.method ?? "GET"} ${path} -> ${response.status}: ${body.error ?? text}`,
    );
  }
  return body;
}

const signIn = (email) =>
  call("/api/auth/login", { method: "POST", body: JSON.stringify({ email }) });

const line = () => console.log("-".repeat(72));

async function main() {
  console.log(`\nFoodBridge demo verification against ${BASE}`);
  line();

  /* -- Step 1: the donor ------------------------------------------------- */
  const { organisation: donor } = await signIn("kitchen@greenleaf.demo");
  check("signed in as Green Leaf Restaurant", donor.name === "Green Leaf Restaurant", donor.name);

  const before = await call("/api/impact");
  check("baseline meals donated is 1200", before.stats.meals_donated === 1200, before.stats.meals_donated);
  check("baseline donations completed is 48", before.stats.donations_completed === 48, before.stats.donations_completed);

  /* -- Step 2: create the donation --------------------------------------- */
  const now = Date.now();
  const local = (ms) => new Date(ms - new Date().getTimezoneOffset() * MINUTE).toISOString().slice(0, 16);

  const { donation, analysis } = await call("/api/donations", {
    method: "POST",
    body: JSON.stringify({
      food_name: "Vegetable Rice",
      food_type: "cooked_meal",
      quantity: 50,
      quantity_unit: "meals",
      meals: 50,
      dietary_type: "vegetarian",
      allergens: [],
      prepared_at: local(now - 60 * MINUTE),
      pickup_start: local(now - 10 * MINUTE),
      pickup_deadline: local(now + 90 * MINUTE),
      latitude: donor.latitude,
      longitude: donor.longitude,
      address: donor.address,
      notes: null,
    }),
  });

  line();
  console.log(`Created ${donation.id} — ${donation.food_name}, ${donation.meals} meals\n`);

  /* -- Step 3: AI waste risk --------------------------------------------- */
  check("waste risk 84-90", analysis.risk_score >= 84 && analysis.risk_score <= 90, analysis.risk_score);
  check("waste risk level HIGH", analysis.risk_level === "HIGH", analysis.risk_level);
  check("risk has explanation prose", donation.waste_risk_explanation.length > 60, `${donation.waste_risk_explanation.length} chars`);
  check("risk has reasons", analysis.reasons.length >= 3, `${analysis.reasons.length} reasons`);

  /* -- Step 4: AI matching ------------------------------------------------ */
  check("3 viable recipients", analysis.match_count === 3, analysis.match_count);
  check("best match is Hope Community Kitchen", analysis.top_match?.name === "Hope Community Kitchen", analysis.top_match?.name);
  check("best match 94-98", analysis.top_match?.score >= 94 && analysis.top_match?.score <= 98, analysis.top_match?.score);

  /* -- Step 5: AI priority ------------------------------------------------ */
  check("pickup priority 92-98", analysis.priority_score >= 92 && analysis.priority_score <= 98, analysis.priority_score);
  check("priority level CRITICAL", analysis.priority_level === "CRITICAL", analysis.priority_level);
  check("donation starts Available", donation.status === "available", donation.status);

  /* -- Step 6: the recipient accepts -------------------------------------- */
  line();
  const { organisation: recipient } = await signIn("coordinator@hopekitchen.demo");
  check("signed in as Hope Community Kitchen", recipient.name === "Hope Community Kitchen", recipient.name);

  const accepted = await call(`/api/donations/${donation.id}/accept`, { method: "POST" });
  check("status Available -> Matched", accepted.donation.status === "matched", accepted.donation.status);
  check("recipient recorded on the donation", accepted.donation.matched_recipient_id === recipient.id, accepted.donation.matched_recipient_id);
  check("priority drops once claimed", accepted.donation.priority_score < analysis.priority_score, `${analysis.priority_score} -> ${accepted.donation.priority_score}`);

  /* -- Step 7: walk the lifecycle ----------------------------------------- */
  for (const status of ["pickup_scheduled", "picked_up", "delivered"]) {
    const result = await call(`/api/donations/${donation.id}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
    check(`status -> ${status}`, result.donation.status === status, result.donation.status);
  }

  /* -- Rejecting an illegal transition ------------------------------------ */
  let rejected = false;
  try {
    await call(`/api/donations/${donation.id}/status`, {
      method: "POST",
      body: JSON.stringify({ status: "available" }),
    });
  } catch {
    rejected = true;
  }
  check("delivered -> available is refused", rejected, rejected ? "409" : "allowed");

  /* -- Step 8: impact updates --------------------------------------------- */
  line();
  const after = await call("/api/impact");
  check("meals donated 1200 -> 1250", after.stats.meals_donated === 1250, after.stats.meals_donated);
  check("donations completed 48 -> 49", after.stats.donations_completed === 49, after.stats.donations_completed);
  check("food saved increased", after.stats.food_saved_kg > before.stats.food_saved_kg, `${before.stats.food_saved_kg} -> ${after.stats.food_saved_kg} kg`);
  check("people served increased", after.stats.people_served > before.stats.people_served, `${before.stats.people_served} -> ${after.stats.people_served}`);

  line();
  console.log(failures === 0 ? "\nAll checks passed.\n" : `\n${failures} check(s) failed.\n`);
  process.exit(failures > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(`\nVerification aborted: ${error.message}\n`);
  process.exit(1);
});
