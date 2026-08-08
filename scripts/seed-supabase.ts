/**
 * Loads the demo dataset into Supabase.
 *
 *   1. Run supabase/schema.sql in the Supabase SQL editor
 *   2. Put NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   3. npm run seed:supabase
 *
 * Re-running replaces the seeded rows, so timestamps are refreshed relative to
 * the current clock — which matters, because the demo donations are defined as
 * offsets from "now".
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

import { buildSeed } from "../src/lib/db/seed";

/** Minimal .env.local reader so the script needs no extra dependency. */
function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const value = match[2].replace(/^["']|["']$/g, "");
      if (value && !process.env[match[1]]) process.env[match[1]] = value;
    }
  } catch {
    // No .env.local — fall back to whatever is already in the environment.
  }
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "\nNEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set" +
        " (in .env.local or the environment).\n",
    );
    process.exit(1);
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const seed = buildSeed(new Date());

  // Children first, so foreign keys never block the delete.
  for (const table of [
    "donation_status_history",
    "matches",
    "donations",
    "organisations",
    "users",
  ]) {
    const { error } = await client.from(table).delete().neq("id", "__none__");
    if (error) throw new Error(`Clearing ${table} failed: ${error.message}`);
    console.log(`cleared ${table}`);
  }

  const inserts: [string, unknown[]][] = [
    ["users", seed.users],
    ["organisations", seed.organisations],
    ["donations", seed.donations],
    ["donation_status_history", seed.history],
  ];

  for (const [table, rows] of inserts) {
    // Chunked: the history table alone is a few hundred rows.
    for (let i = 0; i < rows.length; i += 200) {
      const chunk = rows.slice(i, i + 200);
      const { error } = await client.from(table).insert(chunk);
      if (error) throw new Error(`Inserting into ${table} failed: ${error.message}`);
    }
    console.log(`inserted ${rows.length} rows into ${table}`);
  }

  const delivered = seed.donations.filter((d) => d.status === "delivered");
  console.log(
    `\nDone. Baseline: ${delivered.reduce((s, d) => s + d.meals, 0)} meals across ` +
      `${delivered.length} completed donations.\n`,
  );
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}\n`);
  process.exit(1);
});
