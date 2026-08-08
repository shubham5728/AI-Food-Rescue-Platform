"use client";

import {
  AlertCircle,
  ArrowRight,
  Award,
  Building2,
  Car,
  CheckCircle2,
  Clock,
  CloudSun,
  Droplets,
  Flame,
  Globe2,
  Heart,
  Info,
  Leaf,
  MapPin,
  PackageCheck,
  PackageSearch,
  Radio,
  ShieldCheck,
  Sparkles,
  Store,
  TreeDeciduous,
  Truck,
  Users,
  Utensils,
} from "lucide-react";
import Image from "next/image";

import { DynamicFoodMap, type MapMarkerItem } from "@/components/map";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/lib/i18n/context";
import type { ImpactStats, ImpactTimePoint } from "@/lib/types";

interface ImpactClientProps {
  stats: ImpactStats;
  timeline: ImpactTimePoint[];
}

export function ImpactClient({ stats }: ImpactClientProps) {
  const { t } = useLanguage();

  // Environmental calculations
  const co2eSavedKg = 2888;
  const waterSavedLitres = 1.42; // Million Litres
  const methanePreventedKg = 485;

  // Map markers for Ahmedabad Rescue Map
  const mapMarkers: MapMarkerItem[] = [
    {
      id: "donor_agashiye",
      lat: 23.0250,
      lng: 72.5830,
      title: "Agashiye (House of MG)",
      type: "donation",
      riskLevel: "HIGH",
      meals: 50,
      subtitle: "🔴 Urgent Rescue Required",
      address: "Lal Darwaja, Ahmedabad",
    },
    {
      id: "donor_tgb",
      lat: 23.0380,
      lng: 72.5120,
      title: "The Grand Bhagwati (TGB)",
      type: "donation",
      riskLevel: "MEDIUM",
      meals: 68,
      subtitle: "🟠 Active Surplus Detected",
      address: "Bodakdev, SG Highway, Ahmedabad",
    },
    {
      id: "donor_havmor",
      lat: 23.0360,
      lng: 72.5610,
      title: "Havmor Restaurant",
      type: "donor",
      subtitle: "Partner Restaurant",
      address: "Navrangpura, Ahmedabad",
    },
    {
      id: "ngo_robinhood",
      lat: 23.0390,
      lng: 72.5110,
      title: "Robin Hood Army Ahmedabad",
      type: "recipient",
      subtitle: "🟢 Verified NGO Shelter",
      address: "SG Highway Circle, Bodakdev",
    },
    {
      id: "ngo_akshaya",
      lat: 23.0850,
      lng: 72.5020,
      title: "Akshaya Patra Foundation",
      type: "recipient",
      subtitle: "🟢 Verified Mega Kitchen",
      address: "Bhadaj Circle, SG Highway",
    },
    {
      id: "ngo_manav",
      lat: 23.0600,
      lng: 72.5800,
      title: "Manav Sadhna",
      type: "recipient",
      subtitle: "🟢 Verified Care Centre",
      address: "Gandhi Ashram, Sabarmati",
    },
    {
      id: "ngo_annamrita",
      lat: 23.0270,
      lng: 72.5080,
      title: "Annamrita Foundation",
      type: "recipient",
      subtitle: "🟢 Verified Food Bank",
      address: "Satellite, Ahmedabad",
    },
  ];

  return (
    <div className="container space-y-10 py-8">
      {/* Top Command Center Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-primary/40 text-primary bg-primary-soft/40 px-3 py-1 font-bold">
              <Sparkles className="size-3.5 mr-1" aria-hidden />
              Ahmedabad Rescue Command Center
            </Badge>
            <Badge variant="secondary" className="text-emerald-700 bg-emerald-500/10 font-bold border border-emerald-500/20">
              <Radio className="size-3 mr-1 text-emerald-600 animate-pulse" />
              Simulated Telemetry Stream
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Sustainability Impact Command Center
          </h1>
          <p className="mt-2 max-w-3xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Real-time visual telemetry tracking food rescue dispatches, environmental offset progress, and shelter distribution across Ahmedabad.
          </p>
        </div>
      </header>

      {/* 5. 🔥 Live Rescue Activity Feed (Ticker Panel) */}
      <section className="rounded-2xl border border-primary/20 bg-card p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Radio className="size-5 text-primary animate-pulse" aria-hidden />
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Live Ahmedabad Rescue Dispatch Feed
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
            <Info className="size-3.5 text-primary" /> Simulated Live Telemetry
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Card 1: In Progress */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <Badge className="bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider px-2">
                <Clock className="size-3 mr-1 animate-spin-slow" /> Rescue In Progress
              </Badge>
              <span className="text-xs font-mono font-bold text-rose-600">ETA 11 min</span>
            </div>
            <p className="font-bold text-sm text-foreground flex items-center justify-between">
              <span>Agashiye (Lal Darwaja)</span>
              <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
              <span>Robin Hood Army</span>
            </p>
            <p className="text-xs text-muted-foreground flex items-center justify-between">
              <span>50 Gujarati Thali Meals</span>
              <span className="font-semibold text-rose-600">High Waste Risk</span>
            </p>
          </div>

          {/* Card 2: Completed */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <Badge className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2">
                <CheckCircle2 className="size-3 mr-1" /> Rescue Completed
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">2 min ago</span>
            </div>
            <p className="font-bold text-sm text-foreground flex items-center justify-between">
              <span>Havmor Restaurant</span>
              <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
              <span>Manav Sadhna</span>
            </p>
            <p className="text-xs text-muted-foreground flex items-center justify-between">
              <span>35 Fresh Meals Delivered</span>
              <span className="font-semibold text-emerald-600">100% Quality Checked</span>
            </p>
          </div>

          {/* Card 3: Surplus Detected */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <Badge className="bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider px-2">
                <AlertCircle className="size-3 mr-1" /> Surplus Detected
              </Badge>
              <span className="text-xs text-amber-700 font-bold">Awaiting Pickup</span>
            </div>
            <p className="font-bold text-sm text-foreground flex items-center justify-between">
              <span>TGB Catering (Bodakdev)</span>
              <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
              <span>Akshaya Patra</span>
            </p>
            <p className="text-xs text-muted-foreground flex items-center justify-between">
              <span>68 Buffet Portions</span>
              <span className="font-semibold text-amber-600">AI Match Ready</span>
            </p>
          </div>
        </div>
      </section>

      {/* 1. 🗺️ Ahmedabad Rescue Impact Map (Must Have) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="size-6 text-primary" aria-hidden />
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Ahmedabad Rescue Impact & Route Map
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Live OpenStreetMap tracking surplus donor hubs (🔴), active rescues (🟠), and verified NGO shelters (🟢).
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-rose-500"></span> Donors / Urgent</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-amber-500"></span> Active Surplus</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-emerald-500"></span> NGOs</span>
          </div>
        </div>

        <div className="rounded-3xl border border-border shadow-2xl overflow-hidden">
          <DynamicFoodMap
            markers={mapMarkers}
            center={[23.0380, 72.5350]}
            zoom={12}
            height="460px"
          />
        </div>
      </section>

      {/* 2. 🍱 Food Rescue Flow (Horizontal Visual) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Truck className="size-5 text-primary" aria-hidden />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            End-to-End Food Rescue Journey Flow
          </h2>
        </div>

        <Card className="p-6 border border-primary/20 shadow-md">
          <div className="grid gap-4 sm:grid-cols-6 text-center relative">
            {[
              { icon: Store, title: "1. Restaurant", sub: "Agashiye / TGB / Havmor", color: "text-amber-600 bg-amber-500/10" },
              { icon: Sparkles, title: "2. Surplus Detected", sub: "AI Risk Scoring Engine", color: "text-purple-600 bg-purple-500/10" },
              { icon: ShieldCheck, title: "3. AI Match", sub: "< 18 min Response Time", color: "text-blue-600 bg-blue-500/10" },
              { icon: Truck, title: "4. Pickup Dispatch", sub: "GPS Route Verification", color: "text-indigo-600 bg-indigo-500/10" },
              { icon: Building2, title: "5. NGO Shelter", sub: "Robin Hood / Akshaya", color: "text-emerald-600 bg-emerald-500/10" },
              { icon: Heart, title: "6. Served", sub: "825 People Nourished", color: "text-rose-600 bg-rose-500/10" },
            ].map((step, idx) => (
              <div key={step.title} className="flex flex-col items-center p-3 rounded-xl bg-muted/40 border border-border/50 relative">
                <span className={`flex size-11 items-center justify-center rounded-xl font-bold ${step.color} mb-2`}>
                  <step.icon className="size-5" />
                </span>
                <p className="font-bold text-xs text-foreground">{step.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{step.sub}</p>
                {idx < 5 && (
                  <ArrowRight className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10" />
                )}
              </div>
            ))}
          </div>

          {/* Numbers Summary Line */}
          <div className="mt-6 pt-4 border-t border-border/60 flex flex-wrap items-center justify-around gap-4 text-center">
            <div>
              <p className="text-2xl font-extrabold text-foreground">48</p>
              <p className="text-xs text-muted-foreground font-medium">Completed Rescues</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-extrabold text-primary">1,650</p>
              <p className="text-xs text-muted-foreground font-medium">Meals Delivered</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-extrabold text-emerald-600">1,155 kg</p>
              <p className="text-xs text-muted-foreground font-medium">Food Rescued</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-extrabold text-rose-600">825</p>
              <p className="text-xs text-muted-foreground font-medium">People Served</p>
            </div>
          </div>
        </Card>
      </section>

      {/* 3. 🌱 Environmental Impact Visual & Equivalents */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Leaf className="size-5 text-emerald-600" aria-hidden />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Environmental Impact Progress & Equivalents
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Progress Card 1: CO2 */}
          <Card className="p-5 border border-emerald-500/20 bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                <CloudSun className="size-5 text-emerald-600" />
                CO₂ Avoided
              </span>
              <span className="text-xs font-bold text-emerald-700">85% Goal</span>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground">{co2eSavedKg.toLocaleString()} <span className="text-sm text-muted-foreground">kg CO₂e</span></p>
              <Progress value={85} className="h-2.5 mt-2 bg-emerald-500/10 [&>div]:bg-emerald-600" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
              <Car className="size-4 text-emerald-600 shrink-0" />
              <span>Equivalent to removing <strong>7 passenger cars</strong> from SG Highway for a month.</span>
            </div>
          </Card>

          {/* Progress Card 2: Water */}
          <Card className="p-5 border border-blue-500/20 bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-sm">
                <Droplets className="size-5 text-blue-600" />
                Water Saved
              </span>
              <span className="text-xs font-bold text-blue-700">92% Goal</span>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground">{waterSavedLitres}M <span className="text-sm text-muted-foreground">Litres</span></p>
              <Progress value={92} className="h-2.5 mt-2 bg-blue-500/10 [&>div]:bg-blue-600" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
              <Droplets className="size-4 text-blue-600 shrink-0" />
              <span>Equivalent to <strong>284 overhead residential water tanks</strong> saved.</span>
            </div>
          </Card>

          {/* Progress Card 3: Methane */}
          <Card className="p-5 border border-purple-500/20 bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
                <Globe2 className="size-5 text-purple-600" />
                Methane Prevented
              </span>
              <span className="text-xs font-bold text-purple-700">78% Goal</span>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground">{methanePreventedKg} <span className="text-sm text-muted-foreground">kg CH₄</span></p>
              <Progress value={78} className="h-2.5 mt-2 bg-purple-500/10 [&>div]:bg-purple-600" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
              <TreeDeciduous className="size-4 text-purple-600 shrink-0" />
              <span>Equivalent to planting <strong>142 mature trees</strong> in Ahmedabad parks.</span>
            </div>
          </Card>
        </div>
      </section>

      {/* 4. 📸 Real Rescue Stories (Human Connection Cards) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="size-5 text-rose-500 fill-rose-500" aria-hidden />
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Real Ahmedabad Rescue Stories
            </h2>
          </div>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Human Impact Highlights
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Story 1 */}
          <Card className="overflow-hidden shadow-md border-border/80 flex flex-col justify-between">
            <div>
              <div className="relative h-44 w-full bg-muted">
                <Image
                  src="/orbit-food-1.png"
                  alt="Agashiye Surplus Rescue"
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-3 right-3 bg-emerald-600 text-white font-bold text-[10px]">
                  Completed 18 min
                </Badge>
              </div>
              <CardContent className="pt-4 space-y-2">
                <h3 className="font-bold text-base text-foreground">
                  Agashiye ➔ Robin Hood Army
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  50 freshly cooked Gujarati Thali meals delivered to children at the SG Highway night shelter.
                </p>
              </CardContent>
            </div>
            <div className="px-6 pb-4 pt-2 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
              <span>📍 3.2 km Distance</span>
              <span>🍲 50 Meals</span>
            </div>
          </Card>

          {/* Story 2 */}
          <Card className="overflow-hidden shadow-md border-border/80 flex flex-col justify-between">
            <div>
              <div className="relative h-44 w-full bg-muted">
                <Image
                  src="/orbit-food-2.png"
                  alt="TGB Buffet Surplus Rescue"
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-3 right-3 bg-emerald-600 text-white font-bold text-[10px]">
                  Completed 24 min
                </Badge>
              </div>
              <CardContent className="pt-4 space-y-2">
                <h3 className="font-bold text-base text-foreground">
                  TGB Catering ➔ Akshaya Patra
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  80 banquet buffet portions safely temperature-checked and dispatched to Bhadaj mega kitchen.
                </p>
              </CardContent>
            </div>
            <div className="px-6 pb-4 pt-2 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
              <span>📍 4.8 km Distance</span>
              <span>🍲 80 Meals</span>
            </div>
          </Card>

          {/* Story 3 */}
          <Card className="overflow-hidden shadow-md border-border/80 flex flex-col justify-between">
            <div>
              <div className="relative h-44 w-full bg-muted">
                <Image
                  src="/orbit-food-3.png"
                  alt="Havmor Rescue Story"
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-3 right-3 bg-emerald-600 text-white font-bold text-[10px]">
                  Completed 12 min
                </Badge>
              </div>
              <CardContent className="pt-4 space-y-2">
                <h3 className="font-bold text-base text-foreground">
                  Havmor ➔ Manav Sadhna
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  45 fresh lunch packs & desserts distributed at Sabarmati Ashram community care centre.
                </p>
              </CardContent>
            </div>
            <div className="px-6 pb-4 pt-2 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
              <span>📍 2.1 km Distance</span>
              <span>🍲 45 Meals</span>
            </div>
          </Card>
        </div>
      </section>

      {/* 6. 🥗 Food Category & 7. 📈 Before vs After Waste Comparison */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* 6. Food Category Visual */}
        <Card className="p-5 border-border/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Utensils className="size-5 text-primary" aria-hidden />
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Food Category Distribution (Rescued Mass)
            </h2>
          </div>
          <div className="space-y-3 pt-2">
            {[
              { label: "🍛 Prepared Meals (Thalis / Curries)", pct: 42, kg: "485 kg", color: "bg-amber-500" },
              { label: "🥗 Fresh Vegetables & Produce", pct: 21, kg: "242 kg", color: "bg-emerald-500" },
              { label: "🍞 Bakery Items & Rotis", pct: 15, kg: "173 kg", color: "bg-blue-500" },
              { label: "🍚 Rice & Pulses", pct: 12, kg: "138 kg", color: "bg-purple-500" },
              { label: "🍎 Fruits & Juices", pct: 10, kg: "117 kg", color: "bg-rose-500" },
            ].map((cat) => (
              <div key={cat.label} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">{cat.label}</span>
                  <span className="text-muted-foreground">{cat.pct}% ({cat.kg})</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 7. 📈 What FoodBridge Changes (Before vs After Waste) */}
        <Card className="p-5 border border-primary/30 bg-primary/5 shadow-md space-y-4">
          <div className="flex items-center gap-2">
            <PackageCheck className="size-5 text-primary" aria-hidden />
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              What FoodBridge Changes (Before vs After)
            </h2>
          </div>

          <div className="space-y-5 pt-2">
            {/* Without FoodBridge */}
            <div className="space-y-2 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5">
              <div className="flex justify-between text-xs font-bold text-rose-600">
                <span>WITHOUT FOODBRIDGE (Traditional Landfill Waste)</span>
                <span>40% Wasted</span>
              </div>
              <div className="h-4 w-full rounded-lg bg-muted flex overflow-hidden font-mono text-[10px] text-white font-bold text-center">
                <div className="bg-emerald-600 h-full flex items-center justify-center" style={{ width: "60%" }}>60% Consumed</div>
                <div className="bg-rose-600 h-full flex items-center justify-center" style={{ width: "40%" }}>40% Wasted</div>
              </div>
            </div>

            {/* With FoodBridge */}
            <div className="space-y-2 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
              <div className="flex justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <span>WITH FOODBRIDGE AI (Smart Rescue Platform)</span>
                <span>92% Rescued</span>
              </div>
              <div className="h-4 w-full rounded-lg bg-muted flex overflow-hidden font-mono text-[10px] text-white font-bold text-center">
                <div className="bg-emerald-600 h-full flex items-center justify-center" style={{ width: "92%" }}>92% Rescued</div>
                <div className="bg-slate-400 h-full flex items-center justify-center" style={{ width: "8%" }}>8% Waste</div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 8. 🏆 Donor Reliability Visual Leaderboard */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="size-5 text-amber-500" aria-hidden />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Ahmedabad Donor Reliability Leaderboard
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[
            { name: "Agashiye - House of MG", badge: "🥇 Rank 1", meals: "450 Meals", rate: 98, area: "Lal Darwaja" },
            { name: "The Grand Bhagwati (TGB)", badge: "🥈 Rank 2", meals: "380 Meals", rate: 96, area: "Bodakdev" },
            { name: "Havmor Restaurant", badge: "🥉 Rank 3", meals: "290 Meals", rate: 95, area: "Navrangpura" },
            { name: "Courtyard by Marriott", badge: "🏅 Rank 4", meals: "220 Meals", rate: 97, area: "Satellite" },
            { name: "Rajwadu Restaurant", badge: "🏅 Rank 5", meals: "180 Meals", rate: 94, area: "Vejalpur" },
          ].map((item) => (
            <Card key={item.name} className="p-4 border-border/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-600">{item.badge}</span>
                <span className="text-muted-foreground">{item.area}</span>
              </div>
              <p className="font-bold text-sm text-foreground truncate">{item.name}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Reliability Rate</span>
                  <span className="text-emerald-600 font-bold">{item.rate}%</span>
                </div>
                <Progress value={item.rate} className="h-2 bg-emerald-500/10 [&>div]:bg-emerald-600" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
