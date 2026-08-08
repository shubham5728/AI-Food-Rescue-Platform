import { getDb } from "../src/lib/db/index";

async function main() {
  try {
    const db = getDb();
    const data = await db.listOrganisations();
    console.log("Success:", data.length);
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
