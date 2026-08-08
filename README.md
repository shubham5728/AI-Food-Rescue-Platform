# FoodBridge AI

Rescue surplus food. Match it with people who need it.

A working MVP of an AI-driven food rescue platform: donors post surplus food, the platform predicts what is about to be wasted, works out which verified community organisation can actually use it before the window closes, ranks what a coordinator should handle first, and explains every decision.

---

## 🚀 Setup

Follow these steps to run the platform locally on your machine. **No API keys, no external database, and no configuration are required to run the full demo.**

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open http://localhost:3000 and sign in with a demo organisation to start.

### Running Automated Checks

Every calculation in the demo can be asserted in an automated check:
```bash
npm run build
npx next start -p 3210          # in one terminal
npm run verify:demo -- http://localhost:3210
```

`NEXT_DIST_DIR` puts the production build somewhere other than `.next`, so you can build and verify while `npm run dev` is running against the same checkout:
```bash
NEXT_DIST_DIR=.next-verify npm run build
NEXT_DIST_DIR=.next-verify npx next start -p 3210
```

`npm run calibrate` replays the same scenario directly against the scoring engine and prints the factor breakdown behind each score.

---

## 🏗 Architecture

FoodBridge AI follows a monolithic, full-stack architecture built entirely on **Next.js**. It leverages Server Components for data fetching and Server Actions for mutations, keeping the client bundle small and highly interactive. 

The core AI architecture is **deterministic constraint filtering first, then scoring, then language**. The ordering is the point: a language model never gets the chance to recommend a recipient that cannot take the food.

### Step 1 — Hard constraints (`src/lib/ai/constraints.ts`)
A recipient is removed outright — not ranked lower — when any of these holds:
- the organisation is not verified
- its capacity is below the donation's meal count
- the diet is incompatible (with a strictness hierarchy: vegan food is safe wherever vegetarian food is)
- the donation carries an allergen the organisation cannot handle
- the food category is not one it accepts
- it is beyond the organisation's stated collection range
- its lead time plus travel time does not fit before the pickup deadline
- the food would pass its safe holding time before anyone could arrive

### Step 2 — Deterministic scoring
- **Waste risk** (`risk.ts`) — 0–100 from five weighted pressures (time, freshness decay, quantity at stake, claim status, recipient reach) plus a super-additive term.
- **Match score** (`match.ts`) — mapped onto a 30–100 band considering quantity fit, distance, pickup feasibility, dietary alignment, food-type affinity, and collection capability.
- **Pickup priority** (`priority.ts`) — leans on waste risk but re-weights around actionability and escalates unclaimed food.

### Step 3 — Language (`llm.ts`)
The LLM receives the full factor breakdown as evidence and may do exactly two things: write the prose, and adjust each match score **within ±6 points**. It cannot introduce a recipient, remove one, or move a score far enough to overturn the constraint filtering. 

---

## 🛠 Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v3, shadcn/ui, Recharts, Lucide Icons.
- **Backend:** Next.js Server Actions & API Routes (Node.js runtime).
- **Database:** Local SQLite (`dev.db`), managed via **Prisma ORM v7** with the `better-sqlite3` driver adapter.
- **Validation:** Zod for strict type-safe schema parsing.

---

## 🤖 AI Services

FoodBridge uses OpenAI's API primarily as a **reasoning explainer**, not a blind decision engine.
- **Model:** `gpt-4o-mini` (configurable via `OPENAI_MODEL`).
- **Function:** Takes deterministic mathematical scores and writes a human-readable summary of *why* an organisation is a good match or *why* food is at risk.
- **Fallback:** If the API times out, fails, or is unconfigured, the platform seamlessly falls back to a deterministic narrator that produces a template-based explanation from the exact same data. This is why **the app is fully functional with no OpenAI key**.

---

## 🔐 Credentials & Configuration

Nothing is explicitly required to run the local demo. Each variable upgrades one layer independently — copy `.env.example` to `.env` and fill in what you have.

| Variable | Effect when set |
|---|---|
| `OPENAI_API_KEY` | The LLM writes explanations and re-ranks matches within ±6 points |
| `OPENAI_MODEL` | Defaults to `gpt-4o-mini` |
| `DATABASE_URL` | Sets the Prisma DB connection string. Defaults to `file:./dev.db` (SQLite). |
| `SESSION_SECRET` | Signs the session cookie securely. |

*The OpenAI key is read server-side only and is never sent to the browser (not prefixed `NEXT_PUBLIC_`).*

---

## 🚦 Limits

- **AI Adjustments:** LLM score adjustments are hard-capped at a maximum drift of **±6 points** to prevent hallucinations from overturning mathematically correct matches.
- **Score Bounds:** Risk, match, and priority scores are strictly bounded between 0 and 100.
- **API Rate Limiting:** The platform gracefully handles OpenAI API rate limits or network failures by immediately falling back to the local deterministic narrator.
- **Data Persistence:** The default SQLite setup (`dev.db`) is intended for local demonstration. For production deployment with higher concurrency limits, Prisma can be reconfigured for PostgreSQL.

---

## 🤝 Team Contributions

- **Shubham Kumawat:** Lead frontend engineering, UI/UX implementation, Next.js architecture setup, custom orbit animations, and local SQLite Prisma migrations.
- **Vivek Hingu:** Backend infrastructure, repository maintenance, database optimization, and deployment strategy.
- **Vaibhavi Makwana:** Impact tracking dashboards, analytical models, and additional module implementations.

*(Refer to the GitHub commit history for a complete log of collaborative efforts).*

---

## 📖 The demo in eight steps

| # | Action | What to look for |
|---|--------|------------------|
| 1 | Sign in as **Green Leaf Restaurant** | Donor dashboard, 1,200 meals donated to date |
| 2 | **Add surplus food** — the form is pre-filled | Submit |
| 3 | The verdict appears immediately | 🔴 **Waste risk 87/100 — High**, with the reasons |
| 4 | Open **See the full analysis** | 🏆 **Hope Community Kitchen — 95%**, two alternatives, and the six organisations ruled out before scoring |
| 5 | Pickup priority panel | 🔴 **96/100 — Critical**, with the sentence explaining the position |
| 6 | Switch account → **Hope Community Kitchen**, press **Accept donation** | Available → Matched; priority drops from 96 to 73 |
| 7 | Walk the lifecycle | Pickup Scheduled → Picked Up → Delivered |
| 8 | Open **Impact** | Meals donated **1,200 → 1,250**, completed 48 → 49 |

---

## 📁 Project layout

```
src/
  app/
    (app)/            authenticated shell — dashboard, donations, recipients, impact
    api/              donations, status, accept, reanalyse, auth, impact
    page.tsx          landing
  components/
    ui/               shadcn-style primitives
    dashboard/        donor + recipient dashboards, priority queue
    risk-panel.tsx    AI feature #1 on screen
    match-card.tsx    AI feature #2 on screen
    impact-chart.tsx  Recharts, one measure at a time
  lib/
    ai/               constraints -> risk / match / priority -> llm -> pipeline
    db/               repository interface, memory + Prisma adapters, seed
    service.ts        storage and AI composed; the only place donations are written
    session.ts        signed-cookie sessions
scripts/
  calibrate.ts        replays the demo scenario against the engine
  verify-demo.mjs     drives the real HTTP API end to end
```

---

## 📝 Notes on scope

- **Authentication** is a signed session cookie over the `users` table. The demo needs to switch between a donor and a recipient in one click, and swapping in an external auth provider touches only `src/lib/session.ts`.
- **Tailwind v3**, not v4. Chosen for build predictability with shadcn-style components.
- **Charts show one measure at a time.** Meals, kilograms and donation counts have unrelated scales, so the impact chart uses a segmented control.
- **No map.** Latitude/longitude are stored and distance is computed with a haversine plus a road-detour factor, then converted to travel minutes. That is what the matching actually needs.
- **Scores are recomputed on every read.** A donation that was medium risk an hour ago is high risk now, so list views re-score against the current clock rather than trusting the stored value.
