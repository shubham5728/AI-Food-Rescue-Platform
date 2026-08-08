import { chromium } from "playwright";

const BASE = "http://localhost:3210";
const OUT = "C:/Users/Shubham/AppData/Local/Temp/claude/c--Users-Shubham-Documents-FOODBRIDGE-AI/1e181d7c-9bc0-4fe1-b7c9-6d7f99be20a1/scratchpad/shots";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));

async function shot(path, name, full = false) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
  console.log(`shot ${name} <- ${path}`);
}

await shot("/", "01-landing", true);
await shot("/login", "02-login");

// Sign in as the donor via the API, reusing the browser's cookie jar.
await page.request.post(`${BASE}/api/auth/login`, { data: { email: "kitchen@greenleaf.demo" } });

await shot("/dashboard", "03-donor-dashboard", true);
await shot("/donations/new", "04-create-donation", true);
await shot("/donations/don_a02", "05-donation-detail", true);
await shot("/recipients", "06-recipients");
await shot("/impact", "07-impact", true);

// Chart in table view + an alternate metric, to check the relief path.
await page.goto(`${BASE}/impact`, { waitUntil: "networkidle" });
await page.getByRole("tab", { name: "Food saved" }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/08-impact-kg.png`, clip: { x: 0, y: 380, width: 1440, height: 560 } });
await page.getByRole("button", { name: "Table" }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/09-impact-table.png`, clip: { x: 0, y: 380, width: 1440, height: 560 } });

await page.request.post(`${BASE}/api/auth/login`, { data: { email: "coordinator@hopekitchen.demo" } });
await shot("/dashboard", "10-recipient-dashboard", true);

// Mobile check.
const mobile = await ctx.newPage();
await mobile.setViewportSize({ width: 390, height: 844 });
await mobile.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
await mobile.waitForTimeout(500);
await mobile.screenshot({ path: `${OUT}/11-mobile-recipient.png`, fullPage: true });
console.log("shot 11-mobile-recipient");

console.log(errors.length ? `\nCONSOLE ERRORS:\n${[...new Set(errors)].join("\n")}` : "\nNo console errors.");
await browser.close();
