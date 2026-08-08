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
import { motion, type Variants } from "framer-motion";

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


/**
 * How far each orbit is tipped away from the viewer. One shared value keeps
 * the rings on a common ground plane; give each a different tilt and they stop
 * reading as one system.
 */
const ORBIT_TILT_DEG = 62;

/**
 * A ring in real 3D.
 *
 * The tilt and the spin live on separate elements on purpose: a CSS animation
 * on `transform` replaces the whole property, so a single element cannot hold
 * a static rotateX and an animated rotateY at once.
 */
function Orbit3D({
  radius,
  duration,
  reverse = false,
  faint = false,
  children,
}: {
  radius: number;
  duration: number;
  reverse?: boolean;
  /** The outermost ring sits back a little so it does not compete. */
  faint?: boolean;
  children: React.ReactNode;
}) {
  const size = radius * 2;

  return (
    // Sized and pinned to the scene centre explicitly. An absolutely
    // positioned wrapper with no dimensions falls back to its static position
    // instead of being centred by the parent flex, which throws the whole ring
    // off-axis and pushes items outside the container.
    <div
      className="fb-orbit-3d absolute left-1/2 top-1/2"
      style={{
        width: size,
        height: size,
        marginLeft: -radius,
        marginTop: -radius,
        transform: `rotateX(${ORBIT_TILT_DEG}deg)`,
      }}
    >
      <div
        className="fb-orbit-3d relative w-full h-full"
        style={{
          animation: `${reverse ? "fb-orbit-spin-reverse" : "fb-orbit-spin"} ${duration}s linear infinite`,
        }}
      >
        {/*
          The ring, laid into the same plane the items travel in.

          Items are placed with rotateY(angle) translateZ(radius), so their
          circle lives in this element's XZ plane. A plain div draws its border
          in XY, which after the tilt projects to a visibly different ellipse —
          the items then appear to float off their own track. rotateX(90deg)
          stands the circle up into XZ so the two coincide.
        */}
        <div
          className={`absolute inset-0 rounded-full border border-dashed ${
            faint ? "border-primary/5" : "border-primary/15"
          }`}
          style={{ transform: "rotateX(90deg) translateZ(-1px)" }}
        />
        {children}
      </div>
    </div>
  );
}

/**
 * One item on a ring.
 *
 * Placed with `rotateY(angle) translateZ(radius)`, which puts it on the
 * circumference in depth. Two nested counter-rotations then turn it back to
 * face the viewer: the animated one cancels the ring's spin, the static one
 * cancels the ring's tilt. Perspective does the rest — the far side of the
 * orbit renders smaller and passes behind the centre figure.
 */
function OrbitItem3D({
  angle,
  radius,
  duration,
  reverse = false,
  children,
}: {
  angle: number;
  radius: number;
  duration: number;
  reverse?: boolean;
  children: React.ReactNode;
}) {
  // Create a staggered delay based on angle for the floating animation
  const floatDelay = (angle / 360) * -4;

  return (
    <div
      className="fb-orbit-3d absolute left-1/2 top-1/2 w-16 h-16 -ml-8 -mt-8"
      style={{ transform: `rotateY(${angle}deg) translateZ(${radius}px)` }}
    >
      <div
        className="fb-orbit-3d w-full h-full"
        style={{
          animation: `${reverse ? "fb-orbit-counter-reverse" : "fb-orbit-counter"} ${duration}s linear infinite`,
        }}
      >
        <div 
          className="fb-orbit-3d w-full h-full"
          style={{ animation: `fb-orbit-float 4s ease-in-out infinite`, animationDelay: `${floatDelay}s` }}
        >
          <div
            className="w-full h-full hover:scale-110 transition-transform duration-300 cursor-pointer rounded-full overflow-hidden bg-gradient-to-b from-white to-neutral-50 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.15),0_0_20px_rgba(16,185,129,0.08),inset_0_2px_4px_rgba(255,255,255,1)] p-2 flex items-center justify-center border border-black/5 ring-1 ring-white/60"
            style={{ transform: `rotateY(${-angle}deg) rotateX(${-ORBIT_TILT_DEG}deg) translateZ(1px)`, WebkitBackfaceVisibility: 'hidden' }}
          >
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  // Annotated so "easeOut" narrows to framer-motion's easing union instead of
  // being inferred as a plain string.
  const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

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
      <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40 border-b border-border/40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

        <motion.div 
          className="container grid lg:grid-cols-2 gap-10 items-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col items-start text-left space-y-8 z-10">
            <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="size-4" aria-hidden />
              <span>{t("heroBadge")}</span>
            </motion.div>

            <motion.div variants={fadeUpVariants} className="max-w-2xl space-y-5">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                {t("heroTitle1")} <br className="hidden sm:inline" />
                <span className="text-primary">{t("heroTitle2")}</span>
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
                {t("heroSub")}
              </p>
            </motion.div>

            <motion.div variants={fadeUpVariants} className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/30 font-bold">
                <Link href="/login">
                  {t("btnGetStarted")}
                  <ArrowRight className="size-5 ml-2" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base bg-background/50 hover:bg-muted transition-all font-semibold">
                <Link href="/impact">{t("btnViewImpact")}</Link>
              </Button>
            </motion.div>
          </div>

          <motion.div
            variants={fadeUpVariants}
            className="fb-orbit-scene relative flex items-center justify-center w-full h-[280px] sm:h-[350px] lg:h-[420px] scale-[0.65] sm:scale-75 lg:scale-90 xl:scale-100 mt-8 lg:mt-0"
          >
            <div className="fb-orbit-3d relative flex items-center justify-center w-full h-full">
              {/* Center Human Element */}
              <div className="fb-orbit-3d absolute z-10 flex flex-col items-center justify-center w-36 h-36 rounded-full shadow-[0_0_60px_rgba(16,185,129,0.25),0_20px_40px_-10px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(255,255,255,0.8)] overflow-hidden ring-1 ring-black/5 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-tr before:from-emerald-500/10 before:to-transparent before:pointer-events-none transition-transform duration-700 hover:scale-105 bg-white">
                <img src="/orbit-person-2.png" alt="Person in need" className="w-full h-full object-cover" />
              </div>

              {/* Inner Orbit */}
              <Orbit3D radius={100} duration={60}>
                <OrbitItem3D angle={0} radius={100} duration={60}>
                  <img src="/orbit-food-1.png" alt="Fresh salad" className="w-full h-full object-contain scale-110" />
                </OrbitItem3D>
              </Orbit3D>

              {/* Middle Orbit */}
              <Orbit3D radius={160} duration={90} reverse>
                <OrbitItem3D angle={90} radius={160} duration={90} reverse>
                  <img src="/orbit-food-2.png" alt="Fresh vegetables" className="w-full h-full object-contain scale-110" />
                </OrbitItem3D>
                <OrbitItem3D angle={270} radius={160} duration={90} reverse>
                  <img src="/orbit-food-4.png" alt="Gourmet sandwiches" className="w-full h-full object-contain scale-110" />
                </OrbitItem3D>
              </Orbit3D>

              {/* Outer Orbit (5 items) */}
              <Orbit3D radius={220} duration={120} faint>
                <OrbitItem3D angle={90} radius={220} duration={120}>
                  <img src="/orbit-food-5.png" alt="Hot catering meal" className="w-full h-full object-contain scale-110" />
                </OrbitItem3D>
                <OrbitItem3D angle={162} radius={220} duration={120}>
                  <img src="/orbit-food-3.png" alt="Artisanal bread" className="w-full h-full object-contain scale-110" />
                </OrbitItem3D>
                <OrbitItem3D angle={234} radius={220} duration={120}>
                  <img src="/orbit-food-6.png" alt="Fresh fruits" className="w-full h-full object-contain scale-110" />
                </OrbitItem3D>
                <OrbitItem3D angle={306} radius={220} duration={120}>
                  <img src="/orbit-food-7.png" alt="Bakery pastries" className="w-full h-full object-contain scale-110" />
                </OrbitItem3D>
                <OrbitItem3D angle={18} radius={220} duration={120}>
                  <img src="/orbit-food-8.png" alt="Dairy products" className="w-full h-full object-contain scale-110" />
                </OrbitItem3D>
              </Orbit3D>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Real Ahmedabad Operational Showcase Grid */}
      <section className="container py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card/80 p-4 sm:p-5 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <span className="flex size-2 shrink-0 rounded-full bg-emerald-500 animate-ping" />
              Live Ahmedabad Network
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              13 Verified Partners
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              5 Hotel Donors (Agashiye, TGB, Havmor, Marriott, Rajwadu) & 8 NGO Shelters (Robin Hood, Akshaya Patra, Manav Sadhna) mapped across Ahmedabad.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/80 p-4 sm:p-5 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              <Clock3 className="size-4 text-amber-500" aria-hidden />
              Express Dispatch
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              &lt; 18 min Response
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Surplus food is automatically matched with nearest verified shelter to prevent expiry & ensure immediate delivery.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/80 p-4 sm:p-5 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <ShieldCheck className="size-4 text-blue-500" aria-hidden />
              Safety Assurance
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              100% Quality Checked
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              FSSAI food hygiene standards, prep time checks, and storage freshness verification before listing distribution.
            </p>
          </div>
        </div>
      </section>

      {/* Video Showcase Section (Border-Free & Extra Large) */}
      <section className="container py-10 sm:py-14">
        <div className="mx-auto max-w-6xl space-y-4 text-center">
          <Badge variant="outline" className="px-3 py-1 text-xs border-primary/30 text-primary">
            <Sparkles className="size-3.5 mr-1" aria-hidden />
            {t("videoBadge")}
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl text-foreground">
            {t("videoTitle")}
          </h2>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t("videoSub")}
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
              {t("videoFallback")}
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
            <span className="flex items-center gap-1.5"><span className="size-2.5 shrink-0 rounded-full bg-emerald-600"></span> Donors</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 shrink-0 rounded-full bg-blue-600"></span> NGOs</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 shrink-0 rounded-full bg-red-600"></span> Urgent</span>
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
