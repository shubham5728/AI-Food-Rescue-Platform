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
import type { LandingSnapshot } from "@/lib/service";
import type { ImpactStats } from "@/lib/types";
import { cn, formatDuration, formatNumber } from "@/lib/utils";
import { DynamicFoodMap, type MapMarkerItem, type MapRouteItem } from "@/components/map";

const AHMEDABAD_LANDING_MARKERS: MapMarkerItem[] = [
  {
    id: "m1",
    lat: 23.0258,
    lng: 72.5804,
    title: "Agashiye - House of MG",
    type: "donor",
    subtitle: "Surplus Gujarati Thali",
    meals: 50,
    address: "Opp. Sidi Saiyyed Mosque, Lal Darwaja",
  },
  {
    id: "m2",
    lat: 23.0450,
    lng: 72.5120,
    title: "The Grand Bhagwati (TGB)",
    type: "donor",
    subtitle: "Banquet Catering Surplus",
    meals: 120,
    address: "S.G. Highway, Bodakdev",
  },
  {
    id: "m3",
    lat: 23.0360,
    lng: 72.5610,
    title: "Havmor Restaurant",
    type: "donor",
    subtitle: "North Indian & Desserts",
    meals: 75,
    address: "C.G. Road, Navrangpura",
  },
  {
    id: "m4",
    lat: 23.0280,
    lng: 72.5150,
    title: "Courtyard by Marriott",
    type: "donor",
    subtitle: "Buffet Surplus",
    meals: 90,
    address: "Ramdev Nagar, Satellite",
  },
  {
    id: "m5",
    lat: 23.0030,
    lng: 72.5250,
    title: "Rajwadu Restaurant",
    type: "donor",
    subtitle: "Traditional Meals",
    meals: 65,
    address: "Jivraj Park, Vejalpur",
  },
  {
    id: "ngo1",
    lat: 23.0390,
    lng: 72.5110,
    title: "Robin Hood Army Ahmedabad",
    type: "recipient",
    subtitle: "Night Shelter & Slum Drive",
    address: "SG Highway Circle, Bodakdev",
  },
  {
    id: "ngo2",
    lat: 23.0850,
    lng: 72.5020,
    title: "Akshaya Patra Foundation",
    type: "recipient",
    subtitle: "Central Mega Kitchen & Food Bank",
    address: "Bhadaj Circle, SG Highway",
  },
  {
    id: "ngo3",
    lat: 23.0600,
    lng: 72.5800,
    title: "Manav Sadhna",
    type: "recipient",
    subtitle: "Community Care Centre",
    address: "Gandhi Ashram, Sabarmati",
  },
  {
    id: "ngo4",
    lat: 23.0270,
    lng: 72.5080,
    title: "Annamrita Foundation (ISKCON)",
    type: "recipient",
    subtitle: "Food Relief Kitchen",
    address: "Near ISKCON Temple, Satellite",
  },
  {
    id: "ngo5",
    lat: 23.0340,
    lng: 72.5280,
    title: "Blind People's Association (BPA)",
    type: "recipient",
    subtitle: "Residential Welfare Hostel",
    address: "Jagdish Patel Marg, Vastrapur",
  },
  {
    id: "ngo6",
    lat: 23.0370,
    lng: 72.5320,
    title: "Apang Manav Mandal",
    type: "recipient",
    subtitle: "Shelter & Vocational Centre",
    address: "Dr. Vikram Sarabhai Marg, Vastrapur",
  },
  {
    id: "ngo7",
    lat: 23.0520,
    lng: 72.6010,
    title: "Seva Yajna Samiti",
    type: "recipient",
    subtitle: "Patient & Caregiver Meal Service",
    address: "Civil Hospital Campus, Asarwa",
  },
  {
    id: "ngo8",
    lat: 23.0130,
    lng: 72.5620,
    title: "Kadam NGO",
    type: "recipient",
    subtitle: "Child Nutrition & Welfare",
    address: "Bhattha, Paldi",
  },
];

const AHMEDABAD_LANDING_ROUTES: MapRouteItem[] = [
  {
    id: "r1",
    fromLat: 23.0450,
    fromLng: 72.5120,
    toLat: 23.0390,
    toLng: 72.5110,
    label: "TGB to Robin Hood Army (1.2 km)",
  },
  {
    id: "r2",
    fromLat: 23.0258,
    fromLng: 72.5804,
    toLat: 23.0600,
    toLng: 72.5800,
    label: "Agashiye to Manav Sadhna (4.1 km)",
  },
  {
    id: "r3",
    fromLat: 23.0280,
    fromLng: 72.5150,
    toLat: 23.0270,
    toLng: 72.5080,
    label: "Marriott to Annamrita (0.9 km)",
  },
];


interface LandingClientProps {
  stats: ImpactStats;
  /** Live figures and the current highest-priority open donation. */
  snapshot: LandingSnapshot;
  session: unknown;
  demo: boolean;
}


export function LandingClient({
  stats,
  snapshot,
  session,
  demo,
}: LandingClientProps) {
  const { t } = useLanguage();
  const featured = snapshot.featured;

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

          {/*
            Every figure below is read from the database on each request. The
            previous version hardcoded "13 Verified Partners", "< 18 min
            Response" and "100% Quality Checked / FSSAI standards" — none of
            which the platform measures, and the last of which asserted a
            regulatory status for real named restaurants.
          */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card/80 p-4 sm:p-5 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Utensils className="size-4" aria-hidden />
                Rescued so far
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular">
                {formatNumber(stats.meals_donated)} meals
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {formatNumber(stats.food_saved_kg)} kg of food delivered across{" "}
                {formatNumber(stats.donations_completed)} completed donations,
                feeding an estimated {formatNumber(stats.people_served)} people.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/80 p-4 sm:p-5 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <ShieldCheck className="size-4 text-blue-500" aria-hidden />
                Verified network
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular">
                {snapshot.verified_donors + snapshot.verified_recipients} partners
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {snapshot.verified_donors} donor kitchens and{" "}
                {snapshot.verified_recipients} verified receiving organisations.
                Unverified organisations are filtered out before any match is
                offered.
              </p>
            </div>

            <div
              className={cn(
                "rounded-xl border bg-card/80 p-4 sm:p-5 shadow-sm backdrop-blur",
                stats.meals_at_risk > 0
                  ? "border-signal-critical/30"
                  : "border-border",
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2 font-bold text-sm",
                  stats.meals_at_risk > 0
                    ? "text-signal-critical"
                    : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-2 rounded-full",
                    stats.meals_at_risk > 0
                      ? "bg-signal-critical animate-ping"
                      : "bg-muted-foreground",
                  )}
                />
                Open right now
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular">
                {formatNumber(stats.meals_at_risk)} meals at risk
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Across {stats.high_risk_donations} high-risk donations of{" "}
                {stats.active_donations} currently open. Recomputed on every
                page load, so this moves through the day.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Video Showcase Section (Border-Free & Extra Large) */}
      <section className="container py-10 sm:py-14">
        <div className="mx-auto max-w-6xl space-y-4 text-center">
          <Badge variant="outline" className="px-3 py-1 text-xs border-primary/30 text-primary">
            <Sparkles className="size-3.5 mr-1" aria-hidden />
            AI Video Showcase
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl text-foreground">
            FoodBridge AI — Real-Time Surplus Food Rescue
          </h2>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Watch how our intelligent AI algorithm matches surplus meals from restaurants & event caterers to verified shelters in real-time across Ahmedabad.
          </p>

          <div className="relative mt-6 overflow-hidden rounded-3xl bg-black shadow-2xl">
            <video
              src="/foodbridge-ai-demo.mp4"
              controls
              autoPlay
              muted
              loop
              playsInline
              className="w-full aspect-video rounded-3xl object-cover"
            >
              Your browser does not support HTML5 video player.
            </video>
          </div>
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

          {/*
            A real open donation, scored live — not a mock-up. The previous
            version hardcoded "Best Match — Hope Kitchen (95%)", an
            organisation that no longer exists in the dataset. Anything shown
            here has to survive the data changing underneath it.
          */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {featured ? "Live — highest priority right now" : t("donorPreviewTitle")}
              </p>
              {featured ? (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="flex size-1.5 rounded-full bg-signal-critical animate-ping" />
                  {featured.donor_name}
                </span>
              ) : null}
            </div>
            <CardContent className="space-y-3 pt-4">
              {featured ? (
                <>
                  <div className="rounded-lg border border-signal-critical/25 bg-signal-critical/[0.06] p-3.5">
                    <p className="flex items-center gap-2 text-sm font-semibold text-signal-critical">
                      <Flame className="size-4" aria-hidden />
                      Waste risk {featured.risk_score}/100 —{" "}
                      {featured.risk_level === "HIGH"
                        ? "High"
                        : featured.risk_level === "MEDIUM"
                          ? "Medium"
                          : "Low"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {featured.meals} meals of {featured.food_name}
                      {featured.minutes_remaining > 0
                        ? `, ${formatDuration(featured.minutes_remaining)} left before the pickup deadline.`
                        : ", past its pickup deadline."}
                    </p>
                  </div>

                  <div className="rounded-lg border border-primary/25 bg-primary-soft/60 p-3.5">
                    <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <Sparkles className="size-4" aria-hidden />
                      {featured.top_match_name
                        ? `Best match — ${featured.top_match_name} (${featured.top_match_score}%)`
                        : "No recipient clears every constraint"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {featured.ruled_out} organisation
                      {featured.ruled_out === 1 ? "" : "s"} ruled out on capacity,
                      diet, distance or timing before anything was scored;{" "}
                      {featured.viable} left viable.
                    </p>
                  </div>

                  <div className="rounded-lg border border-signal-high/25 bg-signal-high/[0.06] p-3.5">
                    <p className="flex items-center gap-2 text-sm font-semibold text-signal-high">
                      <ListOrdered className="size-4" aria-hidden />
                      Pickup priority {featured.priority_score}/100 —{" "}
                      {featured.priority_level}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ranked against every other open donation on the platform.
                    </p>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
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
