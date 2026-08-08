import {
  ArrowRight,
  Brain,
  Clock3,
  Flame,
  Leaf,
  ListOrdered,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  Utensils,
  Store,
  Truck,
  Heart,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isDemoMode } from "@/lib/db";
import { getImpactStats } from "@/lib/service";
import { getSession } from "@/lib/session";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

const AI_FEATURES = [
  {
    icon: Flame,
    title: "Predicts what is about to be wasted",
    body: "Every donation is scored 0–100 on time pressure, freshness decay, quantity at stake, claim status and how many recipients can realistically reach it.",
    accent: "text-signal-critical",
    chip: "bg-signal-critical/10",
  },
  {
    icon: Brain,
    title: "Finds the recipient best placed to use it",
    body: "Hard constraints remove anyone who cannot take the food at all. The survivors are scored on quantity fit, distance, pickup feasibility, diet and capability.",
    accent: "text-signal-info",
    chip: "bg-signal-info/10",
  },
  {
    icon: ListOrdered,
    title: "Tells coordinators what to touch first",
    body: "A pickup priority queue that escalates unclaimed, perishable food as its window closes — so the most rescuable meals get attention first.",
    accent: "text-signal-high",
    chip: "bg-signal-high/10",
  },
];

export default async function LandingPage() {
  const [stats, session] = await Promise.all([getImpactStats(), getSession()]);
  const demo = isDemoMode();

  return (
    <div className="min-h-screen">
      {/* ---------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="size-4" aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight">
              FoodBridge<span className="text-primary"> AI</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            {session ? (
              <Button asChild>
                <Link href="/dashboard">
                  Go to dashboard
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="hidden sm:inline-flex">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/login">Open the demo</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      <section className="hero-glow relative overflow-hidden border-b border-border">
        <div className="surface-grain absolute inset-0 opacity-70" aria-hidden />
        <div className="container relative py-16 sm:py-24">
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <Badge variant="success" className="mb-5">
                <Sparkles className="size-3.5" aria-hidden />
                AI decides. Not a chatbot.
              </Badge>

              <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
                Rescue surplus food.
                <br />
                <span className="text-primary">
                  Match it with people who need it.
                </span>
              </h1>

              <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
                Restaurants, hostels and event caterers have food left over. Shelters,
                community kitchens and food banks need it. FoodBridge works out which
                food is about to be lost, who can actually use it before the window
                closes, and what to handle first — and shows its reasoning every time.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/donations/new">
                    <Utensils className="size-4" aria-hidden />
                    Donate food
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard">
                    <Users className="size-4" aria-hidden />
                    Find food
                  </Link>
                </Button>
              </div>

              {demo ? (
                <p className="mt-5 text-sm text-muted-foreground">
                  Running on seeded demo data — no sign-up needed.{" "}
                  <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                    Pick a demo organisation
                  </Link>{" "}
                  to start.
                </p>
              ) : null}
            </div>

            {/* Orbital Animation Right Side */}
            <div className="relative hidden lg:flex items-center justify-center w-full h-[400px]">
              
              {/* Center Human Element */}
              <div className="absolute z-10 flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 border-background shadow-[0_0_40px_rgba(var(--primary),0.3)] overflow-hidden">
                <img src="/orbit-person-1.png" alt="Person in need" className="w-full h-full object-cover" />
              </div>
              
              {/* Inner Orbit */}
              <div className="absolute w-[200px] h-[200px] rounded-full border border-dashed border-border animate-[spin_20s_linear_infinite]">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-card border-2 border-background rounded-full overflow-hidden shadow-md animate-[spin_20s_linear_infinite_reverse]">
                  <img src="/orbit-food-1.png" alt="Fresh salad" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Middle Orbit */}
              <div className="absolute w-[320px] h-[320px] rounded-full border border-dashed border-border animate-[spin_30s_linear_infinite_reverse]">
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-card border-2 border-background rounded-full overflow-hidden shadow-md animate-[spin_30s_linear_infinite]">
                  <img src="/orbit-food-2.png" alt="Fresh vegetables" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-card border-2 border-background rounded-full overflow-hidden shadow-md animate-[spin_30s_linear_infinite]">
                  <img src="/orbit-food-4.png" alt="Gourmet sandwiches" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Outer Orbit */}
              <div className="absolute w-[440px] h-[440px] rounded-full border border-dashed border-border/70 animate-[spin_40s_linear_infinite]">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-card border-2 border-background rounded-full overflow-hidden shadow-md animate-[spin_40s_linear_infinite_reverse]">
                  <img src="/orbit-food-5.png" alt="Hot catering meal" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-card border-2 border-background rounded-full overflow-hidden shadow-md animate-[spin_40s_linear_infinite_reverse]">
                  <img src="/orbit-food-3.png" alt="Artisanal bread" className="w-full h-full object-cover" />
                </div>
              </div>

            </div>
          </div>

          {/* Live counters, computed from delivered donations. */}
          <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
            {[
              { label: "Meals donated", value: stats.meals_donated, icon: Utensils },
              { label: "Food saved", value: stats.food_saved_kg, icon: Leaf, unit: "kg" },
              { label: "People served", value: stats.people_served, icon: Users },
              { label: "Meals at risk now", value: stats.meals_at_risk, icon: Clock3 },
            ].map((tile) => (
              <div key={tile.label} className="bg-card p-5">
                <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <tile.icon className="size-3.5" aria-hidden />
                  {tile.label}
                </dt>
                <dd className="mt-2 text-3xl font-semibold tracking-tight">
                  {formatNumber(tile.value)}
                  {tile.unit ? (
                    <span className="ml-1 text-base font-medium text-muted-foreground">
                      {tile.unit}
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="container py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            Three decisions, made for you
          </h2>
          <p className="mt-3 text-muted-foreground">
            The AI is not a layer of commentary on top of a form. It filters, scores
            and ranks — and the result is what the product actually does next.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {AI_FEATURES.map((feature) => (
            <Card key={feature.title} className="p-6">
              <span
                className={`flex size-10 items-center justify-center rounded-xl ${feature.chip}`}
                aria-hidden
              >
                <feature.icon className={`size-5 ${feature.accent}`} />
              </span>
              <h3 className="mt-4 text-base font-semibold tracking-tight">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="border-y border-border bg-muted/40">
        <div className="container grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              Constraints first. Scores second. Reasons always.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              A recipient that cannot take the food is removed before any model sees
              it — wrong capacity, wrong diet, too far, cannot arrive before the
              deadline, unverified. Only then are the survivors scored, and only then
              does the language model write the explanation. That ordering is why a
              recommendation here can be trusted.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                {
                  icon: ShieldCheck,
                  text: "Unverified organisations never appear in a recommendation",
                },
                {
                  icon: MapPin,
                  text: "Distance is converted to real travel time before it is scored",
                },
                {
                  icon: Clock3,
                  text: "A recipient who cannot arrive before the deadline is filtered out, not ranked lower",
                },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                    <item.icon className="size-3.5" aria-hidden />
                  </span>
                  <span className="text-sm text-foreground/90">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-border bg-card px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                What a donor sees, seconds after submitting
              </p>
            </div>
            <CardContent className="space-y-4 pt-5">
              <div className="rounded-lg border border-signal-critical/25 bg-signal-critical/[0.06] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-signal-critical">
                  <Flame className="size-4" aria-hidden />
                  Waste risk 87 / 100 — High
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  1h 30m left before the deadline, 50 cooked meals, nobody has
                  confirmed collection.
                </p>
              </div>

              <div className="rounded-lg border border-primary/25 bg-primary-soft/60 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Sparkles className="size-4" aria-hidden />
                  Best match — Hope Community Kitchen, 95%
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Accepts vegetarian food, typically takes 50 meals, 3.2 km away, can
                  collect with 59m to spare.
                </p>
              </div>

              <div className="rounded-lg border border-signal-high/25 bg-signal-high/[0.06] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-signal-high">
                  <ListOrdered className="size-4" aria-hidden />
                  Pickup priority 96 / 100 — Critical
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Handle this before anything else in the queue.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="container py-16 text-center sm:py-20">
        <h2 className="text-3xl font-semibold tracking-tight">
          There is surplus food in your city right now
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {formatNumber(stats.active_donations)} donations are open,{" "}
          {formatNumber(stats.meals_at_risk)} meals are at high risk of being lost
          today.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/donations/new">
              <Utensils className="size-4" aria-hidden />
              Donate food
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">
              <Users className="size-4" aria-hidden />
              Find food
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <p className="flex items-center gap-2">
            <Leaf className="size-4 text-primary" aria-hidden />
            FoodBridge AI — surplus food rescue
          </p>
          <p>{demo ? "Demo mode · in-memory data" : "Connected to Supabase"}</p>
        </div>
      </footer>
    </div>
  );
}
