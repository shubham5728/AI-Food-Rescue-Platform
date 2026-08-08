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
  PackageCheck,
  Radio,
  ShieldCheck,
  Sparkles,
  Store,
  Thermometer,
  TreeDeciduous,
  Truck,
  Users,
  Utensils,
} from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

      {/* Live Rescue Activity Feed (Ticker Panel) */}
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

      {/* NEW FEATURE 1: 🚚 Real-Time Dispatch Fleet & Logistics Tracker */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="size-6 text-primary" aria-hidden />
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Express Logistics & Temperature-Controlled Dispatch Fleet
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Insulated transport vehicles maintaining strict food freshness during transit across Ahmedabad.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/30 font-bold">
            3 Active Vans En Route
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4 border-emerald-500/20 bg-emerald-500/5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">Express Electric Van #01</span>
              <Badge className="bg-emerald-600 text-white text-[10px]">Active Transit</Badge>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="flex justify-between font-medium"><span>Route:</span> <strong className="text-foreground">Lal Darwaja ➔ SG Highway</strong></p>
              <p className="flex justify-between font-medium"><span>Cargo:</span> <strong className="text-foreground">50 Hot Meals</strong></p>
              <p className="flex justify-between font-medium"><span>Internal Temp:</span> <strong className="text-emerald-600">68°C (Insulated)</strong></p>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Driver ID: #AHM-V01</span>
              <span>ETA 11 min</span>
            </div>
          </Card>

          <Card className="p-4 border-blue-500/20 bg-blue-500/5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">Cold Storage Van #02</span>
              <Badge className="bg-blue-600 text-white text-[10px]">Refrigerated</Badge>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="flex justify-between font-medium"><span>Route:</span> <strong className="text-foreground">Navrangpura ➔ Sabarmati</strong></p>
              <p className="flex justify-between font-medium"><span>Cargo:</span> <strong className="text-foreground">35 Milk & Dessert Packs</strong></p>
              <p className="flex justify-between font-medium"><span>Chiller Temp:</span> <strong className="text-blue-600">4°C (Optimal)</strong></p>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Driver ID: #AHM-V02</span>
              <span>Completed</span>
            </div>
          </Card>

          <Card className="p-4 border-amber-500/20 bg-amber-500/5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">Express Electric Van #03</span>
              <Badge className="bg-amber-600 text-white text-[10px]">Dispatched</Badge>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="flex justify-between font-medium"><span>Route:</span> <strong className="text-foreground">Bodakdev ➔ Bhadaj Circle</strong></p>
              <p className="flex justify-between font-medium"><span>Cargo:</span> <strong className="text-foreground">68 Buffet Portions</strong></p>
              <p className="flex justify-between font-medium"><span>Internal Temp:</span> <strong className="text-amber-600">65°C (Hot Box)</strong></p>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Driver ID: #AHM-V03</span>
              <span>ETA 16 min</span>
            </div>
          </Card>
        </div>
      </section>

      {/* NEW FEATURE 2: 🛡️ FSSAI Food Safety & Quality Control Verification Grid */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-6 text-emerald-600" aria-hidden />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              FSSAI Food Safety & Hygiene Verification Standard
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Every rescued meal undergoes a 4-point automated safety audit before distribution.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="p-4 border-border/80 shadow-sm space-y-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold">
              <Thermometer className="size-4" />
            </div>
            <p className="font-bold text-sm text-foreground">1. Core Temp Test</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Hot meals verified &gt; 60°C and cold items &lt; 5°C before sealing.
            </p>
            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">100% Passed</Badge>
          </Card>

          <Card className="p-4 border-border/80 shadow-sm space-y-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 font-bold">
              <Clock className="size-4" />
            </div>
            <p className="font-bold text-sm text-foreground">2. Prep Window Check</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Meals dispatched within 3 hours of kitchen preparation time.
            </p>
            <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-500/30">&lt; 18 min Avg</Badge>
          </Card>

          <Card className="p-4 border-border/80 shadow-sm space-y-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 font-bold">
              <PackageCheck className="size-4" />
            </div>
            <p className="font-bold text-sm text-foreground">3. Sealed Container Audit</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tamper-evident food grade packaging verified by rescue driver.
            </p>
            <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-500/30">Food-Grade Sealed</Badge>
          </Card>

          <Card className="p-4 border-border/80 shadow-sm space-y-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 font-bold">
              <Award className="size-4" />
            </div>
            <p className="font-bold text-sm text-foreground">4. FSSAI Kitchen Audit</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All 5 donor hotels certified with 5-star FSSAI hygiene ratings.
            </p>
            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">FSSAI Certified</Badge>
          </Card>
        </div>
      </section>

      {/* Food Rescue Journey Flow (Horizontal Visual) */}
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

      {/* Environmental Impact Progress & Equivalents */}
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

      {/* NEW FEATURE 3: 👥 Demographic Shelter Distribution Breakdown */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-primary" aria-hidden />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Demographic Beneficiary & Shelter Distribution
          </h2>
        </div>

        <Card className="p-5 border-border/80 shadow-sm space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/50">
              <p className="text-xs font-bold text-muted-foreground">Night Shelters & Children</p>
              <p className="text-2xl font-extrabold text-foreground">45% <span className="text-xs font-normal text-muted-foreground">(742 meals)</span></p>
              <Progress value={45} className="h-2 bg-primary/20 [&>div]:bg-primary" />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/50">
              <p className="text-xs font-bold text-muted-foreground">Senior Citizen Care</p>
              <p className="text-2xl font-extrabold text-foreground">28% <span className="text-xs font-normal text-muted-foreground">(462 meals)</span></p>
              <Progress value={28} className="h-2 bg-emerald-500/20 [&>div]:bg-emerald-600" />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/50">
              <p className="text-xs font-bold text-muted-foreground">Hospital Attendant Canteens</p>
              <p className="text-2xl font-extrabold text-foreground">17% <span className="text-xs font-normal text-muted-foreground">(280 meals)</span></p>
              <Progress value={17} className="h-2 bg-blue-500/20 [&>div]:bg-blue-600" />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/50">
              <p className="text-xs font-bold text-muted-foreground">Differently Abled Hostels</p>
              <p className="text-2xl font-extrabold text-foreground">10% <span className="text-xs font-normal text-muted-foreground">(166 meals)</span></p>
              <Progress value={10} className="h-2 bg-purple-500/20 [&>div]:bg-purple-600" />
            </div>
          </div>
        </Card>
      </section>

      {/* Real Rescue Stories */}
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

      {/* Food Category & Before vs After Waste Comparison */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Food Category Visual */}
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

        {/* What FoodBridge Changes (Before vs After Waste) */}
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

      {/* Donor Reliability Visual Leaderboard */}
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
