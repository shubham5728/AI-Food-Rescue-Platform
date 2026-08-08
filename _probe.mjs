import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
p.on("response", r => { if (r.status() >= 400) console.log(r.status(), r.request().method(), r.url()); });
await p.request.post("http://localhost:3210/api/auth/login", { data: { email: "kitchen@greenleaf.demo" } });
for (const path of ["/", "/login", "/dashboard", "/donations/new", "/donations/don_a02", "/recipients", "/impact"]) {
  await p.goto("http://localhost:3210" + path, { waitUntil: "networkidle" });
}
await b.close();
