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
  const { organisation: donor } = await signIn("kitchen@agashiye.demo");
  check("signed in as Agashiye", donor.name === "Agashiye - House of MG", donor.name);

  const before = await call("/api/impact");
  check("baseline meals donated is 1650", before.stats.meals_donated === 1650, before.stats.meals_donated);
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
  check("best match is Manav Sadhna", analysis.top_match?.name === "Manav Sadhna (Sabarmati)", analysis.top_match?.name);
  check("best match 91-97", analysis.top_match?.score >= 91 && analysis.top_match?.score <= 97, analysis.top_match?.score);

  /* -- Step 5: AI priority ------------------------------------------------ */
  check("pickup priority 92-98", analysis.priority_score >= 92 && analysis.priority_score <= 98, analysis.priority_score);
  check("priority level CRITICAL", analysis.priority_level === "CRITICAL", analysis.priority_level);
  check("donation starts Available", donation.status === "available", donation.status);

  /* -- Step 6: the recipient accepts -------------------------------------- */
  line();
  const { organisation: recipient } = await signIn("kitchen@manavsadhna.demo");
  check("signed in as Manav Sadhna", recipient.name === "Manav Sadhna (Sabarmati)", recipient.name);

  const accepted = await call(`/api/donations/${donation.id}/accept`, { method: "POST" });
  check("status Available -> Matched", accepted.donation.status === "matched", accepted.donation.status);
  check("recipient recorded on the donation", accepted.donation.matched_recipient_id === recipient.id, accepted.donation.matched_recipient_id);
  check("priority drops once claimed", accepted.donation.priority_score < analysis.priority_score, `${analysis.priority_score} -> ${accepted.donation.priority_score}`);

  /* -- Step 7: walk the lifecycle ----------------------------------------- */
  // Collection and delivery are gated behind a one-time code, so the walk has
  // to perform the real handshake at each of those two points.
  const advance = async (status) => {
    const result = await call(`/api/donations/${donation.id}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
    check(`status -> ${status}`, result.donation.status === status, result.donation.status);
  };

  await advance("pickup_scheduled");
  await advance("pickup_assigned");

  // Picking up without the donor's code must be refused.
  let blocked = false;
  try {
    await call(`/api/donations/${donation.id}/status`, {
      method: "POST",
      body: JSON.stringify({ status: "picked_up" }),
    });
  } catch {
    blocked = true;
  }
  check("picked_up blocked without OTP", blocked, blocked ? "428" : "allowed");

  // Donor issues the collection code, recipient redeems it.
  await signIn("kitchen@agashiye.demo");
  const collection = await call(`/api/donations/${donation.id}/verify`, {
    method: "PUT",
    body: JSON.stringify({ stage: "collection" }),
  });
  check("collection code issued", /^\d{6}$/.test(collection.code), collection.code);

  await signIn("kitchen@manavsadhna.demo");
  let wrongRejected = false;
  try {
    await call(`/api/donations/${donation.id}/verify`, {
      method: "POST",
      body: JSON.stringify({ stage: "collection", code: "000000" === collection.code ? "111111" : "000000" }),
    });
  } catch {
    wrongRejected = true;
  }
  check("wrong OTP rejected", wrongRejected, wrongRejected ? "400" : "accepted");

  const redeemed = await call(`/api/donations/${donation.id}/verify`, {
    method: "POST",
    body: JSON.stringify({ stage: "collection", code: collection.code }),
  });
  check("collection verified", Boolean(redeemed.verified_at), redeemed.verified_at ?? "no");

  await advance("picked_up");
  await advance("in_transit");

  // Recipient issues the delivery code and redeems it on arrival.
  const delivery = await call(`/api/donations/${donation.id}/verify`, {
    method: "PUT",
    body: JSON.stringify({ stage: "delivery" }),
  });
  await call(`/api/donations/${donation.id}/verify`, {
    method: "POST",
    body: JSON.stringify({ stage: "delivery", code: delivery.code }),
  });
  check("delivery verified", /^\d{6}$/.test(delivery.code), delivery.code);

  await advance("delivered");
  await advance("completed");

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
  check("completed -> available is refused", rejected, rejected ? "409" : "allowed");

  /* -- The new AI features ------------------------------------------------ */
  line();
  const forecast = await call("/api/forecast?hours=24");
  check(
    "surplus forecast returns donors",
    forecast.forecasts.length > 0,
    `${forecast.forecasts.length} donors`,
  );
  const withHistory = forecast.forecasts.filter((f) => f.probability > 0);
  check(
    "forecast has probability + quantity + window",
    withHistory.length > 0 &&
      withHistory[0].expected_meals > 0 &&
      Boolean(withHistory[0].window_start),
    withHistory[0]
      ? `${withHistory[0].probability}% / ${withHistory[0].expected_meals} meals`
      : "none",
  );

  const pos = await call("/api/pos-signals");
  check("POS connector labelled simulated", pos.mode === "simulated", pos.mode);
  check("POS returns signals", pos.signals.length > 0, `${pos.signals.length} kitchens`);

  const routePlan = await call("/api/route-plan");
  check(
    "route plan returns hotspots",
    Array.isArray(routePlan.hotspots) && routePlan.hotspots.length > 0,
    `${routePlan.hotspots?.length ?? 0} hotspots`,
  );

  const perf = await call("/api/ai-performance");
  check(
    "AI performance computed",
    perf.performance.analysed_donations > 0,
    `${perf.performance.analysed_donations} analysed, top-pick ${perf.performance.top_pick_acceptance}%`,
  );

  // A large donation should split rather than be forced on one recipient.
  await signIn("kitchen@agashiye.demo");
  const big = await call("/api/donations", {
    method: "POST",
    body: JSON.stringify({
      food_name: "Wedding Buffet Surplus",
      food_type: "cooked_meal",
      quantity: 400,
      quantity_unit: "meals",
      meals: 400,
      dietary_type: "vegetarian",
      allergens: [],
      prepared_at: local(now - 30 * MINUTE),
      pickup_start: local(now - 5 * MINUTE),
      pickup_deadline: local(now + 180 * MINUTE),
      latitude: donor.latitude,
      longitude: donor.longitude,
      address: donor.address,
      notes: null,
    }),
  });
  const alloc = await call(`/api/donations/${big.donation.id}/allocation`);
  check(
    "400 meals split across recipients",
    alloc.plan.slices.length > 1 && !alloc.plan.single_recipient,
    `${alloc.plan.slices.length} recipients, ${alloc.plan.allocated_meals}/${alloc.plan.total_meals} meals`,
  );
  check(
    "every allocated share is a whole number",
    alloc.plan.slices.every((s) => Number.isInteger(s.meals)) &&
      Number.isInteger(alloc.plan.allocated_meals),
    alloc.plan.slices.map((s) => s.meals).join(" + "),
  );
  check(
    "no share below the collection-worth minimum",
    alloc.plan.slices.every((s) => s.meals >= 10),
    `min ${Math.min(...alloc.plan.slices.map((s) => s.meals))}`,
  );

  /* -- Step 8: impact updates --------------------------------------------- */
  line();
  const after = await call("/api/impact");
  check("meals donated 1650 -> 1700", after.stats.meals_donated === 1700, after.stats.meals_donated);
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
