# FoodBridge AI

Rescue surplus food. Match it with people who need it.

A working MVP of an AI-driven food rescue platform: donors post surplus food, the
platform predicts what is about to be wasted, works out which verified community
organisation can actually use it before the window closes, ranks what a
coordinator should handle first, and explains every decision.

```bash
npm install
npm run dev
```

Open http://localhost:3000 and sign in with a demo organisation. **No API keys,
no database and no configuration are required to run the full demo.**

---

## The demo in eight steps

| # | Action | What to look for |
|---|--------|------------------|
| 1 | Sign in as **Green Leaf Restaurant** | Donor dashboard, 1,200 meals donated to date |
| 2 | **Add surplus food** — the form is pre-filled with 50 vegetarian meals, prepared an hour ago, 90 minutes to the deadline | Submit |
| 3 | The verdict appears immediately | 🔴 **Waste risk 87/100 — High**, with the reasons |
| 4 | Open **See the full analysis** | 🏆 **Hope Community Kitchen — 95%**, two alternatives, and the six organisations ruled out before scoring with the reason for each |
| 5 | Pickup priority panel | 🔴 **96/100 — Critical**, with the sentence explaining the position |
| 6 | Switch account → **Hope Community Kitchen**, press **Accept donation** | Available → Matched; priority drops from 96 to 73 |
| 7 | Walk the lifecycle | Pickup Scheduled → Picked Up → Delivered |
| 8 | Open **Impact** | Meals donated **1,200 → 1,250**, completed 48 → 49 |

Every number above is asserted in an automated check:

```bash
npm run build
npx next start -p 3210          # in one terminal
npm run verify:demo -- http://localhost:3210
```

`npm run calibrate` replays the same scenario directly against the scoring
engine and prints the factor breakdown behind each score.

---

## How the AI actually works

The architecture is **deterministic constraint filtering first, then scoring,
then language**. The ordering is the point: a model never gets the chance to
recommend a recipient that cannot take the food.

### Step 1 — Hard constraints ([`src/lib/ai/constraints.ts`](src/lib/ai/constraints.ts))

A recipient is removed outright — not ranked lower — when any of these holds:

- the organisation is not verified
- its capacity is below the donation's meal count
- the diet is incompatible (with a strictness hierarchy: vegan food is safe
  wherever vegetarian food is)
- the donation carries an allergen the organisation cannot handle
- the food category is not one it accepts
- it is beyond the organisation's stated collection range
- its lead time plus travel time does not fit before the pickup deadline
- the food would pass its safe holding time before anyone could arrive

Rejections are kept, not discarded, and shown on the donation page with the
reason for each — so a judge can see *why* six organisations were never
considered.

### Step 2 — Deterministic scoring

**Waste risk** ([`risk.ts`](src/lib/ai/risk.ts)) — 0–100 from five weighted
pressures plus a super-additive term, because the failure this platform exists
to prevent is not any single pressure but their coincidence:

| Factor | Weight | What it measures |
|---|---|---|
| Time pressure | 0.44 | Usable time left, after subtracting a 40-minute logistics floor |
| Freshness decay | 0.16 | Share of the food's safe holding time already consumed |
| Quantity at stake | 0.12 | How many meals are lost if this fails |
| Claim status | 0.18 | Whether anyone has committed to collect |
| Recipient reach | 0.10 | How thin the market is — one viable recipient is one point of failure |
| *Compound* | ≤0.18 | Perishable **and** unclaimed **and** urgent, together |

**Match score** ([`match.ts`](src/lib/ai/match.ts)) — quantity fit (log-normal
around the recipient's typical intake), distance (absolute closeness blended
with how much of their stated range the trip consumes), pickup feasibility,
dietary alignment, food-type affinity and collection capability. Mapped onto a
30–100 band: a candidate that survived the hard filter is by definition workable,
and showing it as "12% match" would be a lie.

**Pickup priority** ([`priority.ts`](src/lib/ai/priority.ts)) — leans on waste
risk but re-weights around actionability, then escalates unclaimed food as its
window closes. Risk asks "will this be lost?"; priority asks "what should I
touch first?" — a donation can be risky but already handled.

### Step 3 — Language ([`llm.ts`](src/lib/ai/llm.ts))

The LLM receives the full factor breakdown as evidence and may do exactly two
things: write the prose, and adjust each match score **within ±6 points**. It
cannot introduce a recipient, remove one, or move a score far enough to overturn
the constraint filtering. Any recipient id it invents is dropped; malformed
output, a timeout or a missing key falls back to a deterministic narrator that
produces the same shape from the same data.

This is why **the app is fully functional with no OpenAI key** — the scores are
always the engine's. The key upgrades the writing, not the decisions. The UI
states which is in play.

---

## Configuration

Nothing is required. Each variable upgrades one layer independently — copy
`.env.example` to `.env.local` and fill in what you have.

| Variable | Effect when set |
|---|---|
| `OPENAI_API_KEY` | The LLM writes explanations and re-ranks within ±6 points |
| `OPENAI_MODEL` | Defaults to `gpt-4o-mini` |
| `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Persists to Postgres instead of memory |
| `SESSION_SECRET` | Signs the session cookie |

The OpenAI key is read server-side only, in an API route. It is never sent to
the browser and is not prefixed `NEXT_PUBLIC_`.

### Supabase

```bash
# 1. Run supabase/schema.sql in the Supabase SQL editor
# 2. Add the URL + service-role key to .env.local
npm run seed:supabase
```

The schema includes row-level security policies: the directory of verified
organisations and open donations is readable with the anon key (that is the
point of the platform), nothing is writable from the browser, and `users` is
service-role only.

### Demo mode

With no Supabase credentials the app runs on a seeded in-memory store
([`src/lib/db/memory.ts`](src/lib/db/memory.ts)). It is deliberate, not a stub:
the same repository interface, the same service layer, the same AI pipeline.
State resets when the server restarts, and it is not shared between serverless
instances — so use Supabase for a deployed demo.

Seed timestamps are derived from *now* rather than fixed clock times, so the
scenario reproduces whenever the app is opened. A donation seeded with a hard
2:00 PM deadline is uninteresting at 6:00 PM.

---

## Deploying

Push to GitHub, import into Vercel, add the environment variables above. No
build configuration is needed. Without Supabase it will still boot and demo,
but each serverless instance keeps its own copy of the data.

---

## Project layout

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
    db/               repository interface, memory + Supabase adapters, seed
    service.ts        storage and AI composed; the only place donations are written
    session.ts        signed-cookie sessions
scripts/
  calibrate.ts        replays the demo scenario against the engine
  verify-demo.mjs     drives the real HTTP API end to end
  seed-supabase.ts
supabase/schema.sql
```

---

## Notes on scope

Some decisions worth stating plainly:

- **Authentication** is a signed session cookie over the `users` table rather
  than Supabase Auth. The demo needs to switch between a donor and a recipient
  in one click, and every authorisation check reads from
  [`src/lib/session.ts`](src/lib/session.ts) — swapping in Supabase Auth touches
  that file and nothing else.
- **Tailwind v3**, not v4. Chosen for build predictability with shadcn-style
  components.
- **Charts show one measure at a time.** Meals, kilograms and donation counts
  have unrelated scales, so the impact chart uses a segmented control rather
  than a second y-axis. The palette is validated for colourblind separation and
  contrast; the amber series sits below 3:1 on the card surface, which is why
  the chart always ships a table view.
- **No map.** Latitude/longitude are stored and distance is computed with a
  haversine plus a road-detour factor, then converted to travel minutes. That is
  what the matching actually needs; a Mapbox view would be presentation only.
- **Scores are recomputed on every read.** A donation that was medium risk an
  hour ago is high risk now, so list views re-score against the current clock
  rather than trusting the stored value, and the donation page flags when the
  live score has drifted from the written explanation.
