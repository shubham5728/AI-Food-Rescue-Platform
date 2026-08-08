"use client";

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
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import { useLanguage } from "@/lib/i18n/context";
import { formatNumber } from "@/lib/utils";
import { DynamicFoodMap, type MapMarkerItem, type MapRouteItem } from "@/components/map";

const AHMEDABAD_LANDING_MARKERS: MapMarkerItem[] = [
  {
    id: "m1",
    lat: 23.0258,
    lng: 72.5804,
    title: "Agashiye - House of MG",
    type: "donor",
    subtitle: "Lal Darwaja, Ahmedabad",
    meals: 50,
    address: "Opp. Sidi Saiyyed Mosque",
  },
  {
    id: "m2",
    lat: 23.0450,
    lng: 72.5120,
    title: "The Grand Bhagwati (TGB)",
    type: "donor",
    subtitle: "S.G. Highway, Bodakdev",
    meals: 120,
    address: "Bodakdev, Ahmedabad",
  },
  {
    id: "m3",
    lat: 23.0360,
    lng: 72.5610,
    title: "Havmor Restaurant",
    type: "donor",
    subtitle: "Navrangpura, Ahmedabad",
    meals: 75,
    address: "C.G. Road, Ahmedabad",
  },
  {
    id: "m4",
    lat: 23.0390,
    lng: 72.5110,
    title: "Robin Hood Army Ahmedabad",
    type: "recipient",
    subtitle: "Community Kitchen & Shelter",
    address: "SG Highway Circle, Ahmedabad",
  },
  {
    id: "m5",
    lat: 23.0850,
    lng: 72.5020,
    title: "Akshaya Patra Foundation",
    type: "recipient",
    subtitle: "Food Bank",
    address: "Bhadaj Circle, SG Highway",
  },
  {
    id: "m6",
    lat: 23.0600,
    lng: 72.5800,
    title: "Manav Sadhna",
    type: "recipient",
    subtitle: "Sabarmati Ashram",
    address: "Gandhi Ashram, Sabarmati",
  },
];

const AHMEDABAD_LANDING_ROUTES: MapRouteItem[] = [
  {
    id: "r1",
    fromLat: 23.0450,
    fromLng: 72.5120,
    toLat: 23.0390,
    toLng: 72.5110,
    label: "Active Rescue Route (1.2 km)",
  },
  {
    id: "r2",
    fromLat: 23.0258,
    fromLng: 72.5804,
    toLat: 23.0600,
    toLng: 72.5800,
    label: "Food Delivery Route (4.1 km)",
  },
];

interface LandingClientProps {
  stats: {
    meals_donated: number;
    food_saved_kg: number;
    people_served: number;
    meals_at_risk: number;
    active_donations: number;
  };
  session: unknown;
  demo: boolean;
}


export function LandingClient({ stats, session, demo }: LandingClientProps) {
  const { t } = useLanguage();

  const AI_FEATURES = [
    {
      icon: Flame,
      title: t("feat1Title"),
      body: t("feat1Body"),
      accent: "text-signal-critical",
      chip: "bg-signal-critical/10",
    },
    {
      icon: Brain,
      title: t("feat2Title"),
      body: t("feat2Body"),
      accent: "text-signal-info",
      chip: "bg-signal-info/10",
    },
    {
      icon: ListOrdered,
      title: t("feat3Title"),
      body: t("feat3Body"),
      accent: "text-signal-high",
      chip: "bg-signal-high/10",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
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

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <nav className="flex items-center gap-2">
              {session ? (
                <Button asChild size="sm">
                  <Link href="/dashboard">
                    {t("btnDashboard")}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                    <Link href="/login">{t("navLogin")}</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/login">{t("btnDemo")}</Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-glow relative overflow-hidden border-b border-border">
        <div className="surface-grain absolute inset-0 opacity-70" aria-hidden />
        <div className="container relative py-12 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="max-w-2xl">
              <Badge variant="success" className="mb-4">
                <Sparkles className="size-3.5" aria-hidden />
                {t("aiBadge")}
              </Badge>

              <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                {t("heroTitle1")}
                <br />
                <span className="text-primary">{t("heroTitle2")}</span>
              </h1>

              <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                {t("heroSubtitle")}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/donations/new">
                    <Utensils className="size-4" aria-hidden />
                    {t("btnDonate")}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard">
                    <Users className="size-4" aria-hidden />
                    {t("btnFind")}
                  </Link>
                </Button>
              </div>

              {demo && (
                <p className="mt-4 text-xs sm:text-sm text-muted-foreground">
                  ⚡ {t("demoMode")} —{" "}
                  <Link href="/login" className="font-medium text-primary underline hover:underline">
                    {t("navLogin")}
                  </Link>
                </p>
              )}
            </div>

            {/* Orbital Animation Right Side (Friend's 3D Food Photography & Hover Glow) */}
            <div className="relative hidden lg:flex items-center justify-center w-full h-[420px]">
              
              {/* Center Human Element */}
              <div className="absolute z-10 flex flex-col items-center justify-center w-32 h-32 rounded-full shadow-[0_0_50px_rgba(var(--primary),0.2)] overflow-hidden">
                <img src="/orbit-person-2.png" alt="Person in need" className="w-full h-full object-cover mix-blend-multiply" />
              </div>
              
              {/* Inner Orbit */}
              <div className="absolute w-[200px] h-[200px] rounded-full border border-dashed border-border" style={{ animation: 'spin 60s linear infinite' }}>
                <div style={{ left: '68px', top: '-32px', animation: 'spin 60s linear infinite reverse' }} className="absolute w-16 h-16 bg-card border-2 border-background rounded-full overflow-hidden shadow-md hover:shadow-[0_0_30px_rgba(var(--primary),0.8)] hover:scale-110 transition-all duration-300 cursor-pointer">
                  <img src="/orbit-food-1.png" alt="Fresh salad" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Middle Orbit */}
              <div className="absolute w-[320px] h-[320px] rounded-full border border-dashed border-border" style={{ animation: 'spin 90s linear infinite reverse' }}>
                <div style={{ left: '288px', top: '128px', animation: 'spin 90s linear infinite' }} className="absolute w-16 h-16 bg-card border-2 border-background rounded-full overflow-hidden shadow-md hover:shadow-[0_0_30px_rgba(var(--primary),0.8)] hover:scale-110 transition-all duration-300 cursor-pointer">
                  <img src="/orbit-food-2.png" alt="Fresh vegetables" className="w-full h-full object-cover" />
                </div>
                <div style={{ left: '-32px', top: '128px', animation: 'spin 90s linear infinite' }} className="absolute w-16 h-16 bg-card border-2 border-background rounded-full overflow-hidden shadow-md hover:shadow-[0_0_30px_rgba(var(--primary),0.8)] hover:scale-110 transition-all duration-300 cursor-pointer">
                  <img src="/orbit-food-4.png" alt="Gourmet sandwiches" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Outer Orbit (5 items) */}
              <div className="absolute w-[440px] h-[440px] rounded-full border border-dashed border-border/70" style={{ animation: 'spin 120s linear infinite' }}>
                <div style={{ left: '408px', top: '188px', animation: 'spin 120s linear infinite reverse' }} className="absolute w-16 h-16 bg-card border-2 border-background rounded-full overflow-hidden shadow-md hover:shadow-[0_0_30px_rgba(var(--primary),0.8)] hover:scale-110 transition-all duration-300 cursor-pointer">
                  <img src="/orbit-food-5.png" alt="Hot catering meal" className="w-full h-full object-cover" />
                </div>
                <div style={{ left: '256px', top: '397px', animation: 'spin 120s linear infinite reverse' }} className="absolute w-16 h-16 bg-card border-2 border-background rounded-full overflow-hidden shadow-md hover:shadow-[0_0_30px_rgba(var(--primary),0.8)] hover:scale-110 transition-all duration-300 cursor-pointer">
                  <img src="/orbit-food-3.png" alt="Artisanal bread" className="w-full h-full object-cover" />
                </div>
                <div style={{ left: '10px', top: '317px', animation: 'spin 120s linear infinite reverse' }} className="absolute w-16 h-16 bg-card border-2 border-background rounded-full overflow-hidden shadow-md hover:shadow-[0_0_30px_rgba(var(--primary),0.8)] hover:scale-110 transition-all duration-300 cursor-pointer">
                  <img src="/orbit-food-6.png" alt="Fresh fruits" className="w-full h-full object-cover" />
                </div>
                <div style={{ left: '10px', top: '59px', animation: 'spin 120s linear infinite reverse' }} className="absolute w-16 h-16 bg-card border-2 border-background rounded-full overflow-hidden shadow-md hover:shadow-[0_0_30px_rgba(var(--primary),0.8)] hover:scale-110 transition-all duration-300 cursor-pointer">
                  <img src="/orbit-food-7.png" alt="Bakery pastries" className="w-full h-full object-cover" />
                </div>
                <div style={{ left: '256px', top: '-21px', animation: 'spin 120s linear infinite reverse' }} className="absolute w-16 h-16 bg-card border-2 border-background rounded-full overflow-hidden shadow-md hover:shadow-[0_0_30px_rgba(var(--primary),0.8)] hover:scale-110 transition-all duration-300 cursor-pointer">
                  <img src="/orbit-food-8.png" alt="Dairy products" className="w-full h-full object-cover" />
                </div>
              </div>

            </div>
          </div>

          {/* Live Counters */}
          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
            {[
              { label: t("mealsDonated"), value: stats.meals_donated, icon: Utensils },
              { label: t("foodSaved"), value: stats.food_saved_kg, icon: Leaf, unit: t("unitKg") },
              { label: t("peopleServed"), value: stats.people_served, icon: Users },
              { label: t("mealsAtRisk"), value: stats.meals_at_risk, icon: Clock3 },
            ].map((tile) => (
              <div key={tile.label} className="bg-card p-4 sm:p-5">
                <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <tile.icon className="size-3.5 text-primary" aria-hidden />
                  {tile.label}
                </dt>
                <dd className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  {formatNumber(tile.value)}
                  {tile.unit ? (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {tile.unit}
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="container py-12 sm:py-16">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("featuresHeading")}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            {t("featuresSub")}
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {AI_FEATURES.map((feature) => (
            <Card key={feature.title} className="p-5">
              <span className={`flex size-9 items-center justify-center rounded-lg ${feature.chip}`}>
                <feature.icon className={`size-4 ${feature.accent}`} />
              </span>
              <h3 className="mt-3 text-base font-semibold tracking-tight">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {feature.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust & Rules Section */}
      <section className="border-y border-border bg-muted/40">
        <div className="container grid gap-8 py-12 lg:grid-cols-2 lg:items-center sm:py-16">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("trustHeading")}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("trustSub")}
            </p>

            <ul className="mt-5 space-y-2.5">
              {[t("trustPoint1"), t("trustPoint2"), t("trustPoint3")].map((text, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <ShieldCheck className="size-4 shrink-0 text-primary mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-border bg-card px-4 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("donorPreviewTitle")}
              </p>
            </div>
            <CardContent className="space-y-3 pt-4">
              <div className="rounded-lg border border-signal-critical/25 bg-signal-critical/[0.06] p-3.5">
                <p className="flex items-center gap-2 text-sm font-semibold text-signal-critical">
                  <Flame className="size-4" aria-hidden />
                  {t("riskHigh")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("riskBody")}
                </p>
              </div>

              <div className="rounded-lg border border-primary/25 bg-primary-soft/60 p-3.5">
                <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Sparkles className="size-4" aria-hidden />
                  {t("matchBest")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("matchBody")}
                </p>
              </div>

              <div className="rounded-lg border border-signal-high/25 bg-signal-high/[0.06] p-3.5">
                <p className="flex items-center gap-2 text-sm font-semibold text-signal-high">
                  <ListOrdered className="size-4" aria-hidden />
                  {t("priorityCritical")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("priorityBody")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Real Interactive Map Section */}
      <section className="container py-12 sm:py-16">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6">
          <div>
            <Badge variant="outline" className="mb-2">
              <MapPin className="size-3.5 text-primary" aria-hidden />
              Ahmedabad Real-Time Map
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Live Ahmedabad Food Rescue Network
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
              Interactive OpenStreetMap showing live donors, verified NGO shelters, and active pickup routes across Ahmedabad.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-600"></span> Donors</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-blue-600"></span> NGOs</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-red-600"></span> Urgent</span>
          </div>
        </div>

        <DynamicFoodMap
          markers={AHMEDABAD_LANDING_MARKERS}
          routes={AHMEDABAD_LANDING_ROUTES}
          center={[23.0350, 72.5450]}
          zoom={12}
          height="450px"
        />
      </section>


      {/* CTA Section */}
      <section className="container py-12 text-center sm:py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("ctaTitle")}
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm sm:text-base text-muted-foreground">
          {t("ctaSub")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/donations/new">
              <Utensils className="size-4" aria-hidden />
              {t("btnDonate")}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">
              <Users className="size-4" aria-hidden />
              {t("btnFind")}
            </Link>
          </Button>
        </div>
      </section>


      {/* Footer */}
      <footer className="mt-auto border-t border-border py-6">
        <div className="container flex flex-col items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground sm:flex-row">
          <p className="flex items-center gap-2">
            <Leaf className="size-4 text-primary" aria-hidden />
            {t("brandName")} — {t("brandTagline")}
          </p>
          <p>{demo ? t("demoMode") : "Connected to Supabase"}</p>
        </div>
      </footer>
    </div>
  );
}
