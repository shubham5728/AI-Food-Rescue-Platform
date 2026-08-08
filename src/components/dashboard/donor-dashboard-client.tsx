"use client";

import {
  Building2,
  CloudSun,
  Droplets,
  Flame,
  ListOrdered,
  MapPin,
  PackageSearch,
  Plus,
  Radio,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Utensils,
} from "lucide-react";
import Link from "next/link";

import { DonationCard } from "@/components/donation-card";
import { PriorityQueue } from "@/components/dashboard/priority-queue";
import { StatTile } from "@/components/stat-tile";
import { DynamicFoodMap, type MapMarkerItem } from "@/components/map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useLanguage } from "@/lib/i18n/context";
import { motion, type Variants } from "framer-motion";
import type { ScoredDonation } from "@/lib/service";
import type { Organisation } from "@/lib/types";

interface DonorDashboardClientProps {
  organisation: Organisation;
  stats: {
    meals_donated: number;
    food_saved_kg: number;
    donations_completed: number;
    people_served: number;
    meals_at_risk: number;
    high_risk_donations: number;
  };
  myActive: ScoredDonation[];
  queue: ScoredDonation[];
  recent: ScoredDonation[];
}

export function DonorDashboardClient({
  organisation,
  stats,
  myActive,
  queue,
  recent,
}: DonorDashboardClientProps) {
  const { t } = useLanguage();

  // Environmental calculations
  const co2eSavedKg = Math.round(stats.food_saved_kg * 2.5);
  const waterSavedLitres = Math.round(stats.food_saved_kg * 1230);

  const donorMarkers: MapMarkerItem[] = [
    {
      id: organisation.id,
      lat: organisation.latitude,
      lng: organisation.longitude,
      title: organisation.name,
      type: "donor",
      subtitle: t("yourOrg"),
      address: organisation.address,
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
    ...myActive.map((item) => ({
      id: item.donation.id,
      lat: item.donation.latitude,
      lng: item.donation.longitude,
      title: item.donation.food_name,
      type: "donation" as const,
      riskLevel: item.risk.level,
      meals: item.donation.meals,
      address: item.donation.address,
    })),
  ];

  // Typed as Variants so `type: "spring"` is contextually narrowed to the
  // animation-generator union rather than inferred as a plain string.
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemAnim: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <motion.div 
      className="container space-y-8 py-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Top Welcome Header */}
      <motion.header variants={itemAnim} className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className="border-primary/30 text-primary">
              <Building2 className="size-3.5 mr-1" aria-hidden />
              {organisation.type.toUpperCase()} · {t("orgVerifiedPartner")}
            </Badge>
            <Badge variant="secondary" className="text-emerald-700 bg-emerald-500/10">
              <ShieldCheck className="size-3.5 mr-1 text-emerald-600" />
              98% {t("orgReliability")}
            </Badge>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            {organisation.name}
          </h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            {myActive.length > 0
              ? `${myActive.length} ${t("activeListingsMsg")}`
              : t("dashSub")}
          </p>
        </div>
        <Button asChild size="lg" className="shadow-md font-bold">
          <Link href="/donations/new">
            <Plus className="size-4" aria-hidden />
            {t("btnNewDonation")}
          </Link>
        </Button>
      </motion.header>

      {/* Live GPS Delivery Tracking Banner Card */}
      <Card className="border border-primary/30 bg-primary/5 p-4 sm:p-5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow">
              <Truck className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-extrabold text-base text-foreground">{t("liveRescueTracking")}</span>
                <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                  <Radio className="size-3 mr-1 animate-pulse" /> {t("liveGPSConnected")}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("driverStatusDonor")}
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="font-bold shadow">
            <Link href="/tracking/del_demo01">
              {t("openLiveMap")}
            </Link>
          </Button>
        </div>
      </Card>

      {/* Main KPI Stat Tiles */}
      <motion.section variants={itemAnim} aria-label="Impact">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label={t("mealsDonated")}
            value={stats.meals_donated}
            icon={Utensils}
            accent="var(--chart-meals)"
            hint="Delivered surplus"
            emphasis
          />
          <StatTile
            label={t("foodSaved")}
            value={stats.food_saved_kg}
            unit={t("unitKg")}
            icon={PackageSearch}
            accent="var(--chart-kg)"
            hint={`${stats.donations_completed} ${t("statusDelivered").toLowerCase()}`}
          />
          <StatTile
            label={t("peopleServed")}
            value={stats.people_served}
            icon={Users}
            accent="var(--chart-completed)"
            hint="Community impact"
          />
          <StatTile
            label={t("mealsAtRisk")}
            value={stats.meals_at_risk}
            icon={Flame}
            accent="var(--chart-risk)"
            hint={`${stats.high_risk_donations} ${t("riskHigh").toLowerCase()}`}
          />
        </div>
      </motion.section>

      {/* Environmental Footprint Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="border border-emerald-500/20 bg-emerald-500/5 shadow-sm p-4 sm:p-5">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <CloudSun className="size-4 text-emerald-600" />
                {t("co2Title")}
              </p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
                {co2eSavedKg.toLocaleString()} {t("co2Unit")}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("co2Subtitle")}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold text-lg border border-emerald-500/20">
              🌿
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-500/20 bg-blue-500/5 shadow-sm p-4 sm:p-5">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <Droplets className="size-4 text-blue-600" />
                {t("waterTitle")}
              </p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
                {(waterSavedLitres / 1000).toFixed(1)} {t("waterUnit")}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("waterSubtitle")}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 font-bold text-lg border border-blue-500/20">
              💧
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Live Ahmedabad Real Satellite Map */}
      <section aria-label="Live Map" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" aria-hidden />
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              {t("liveDispatchMapTitle")}
            </h2>
          </div>
          <Badge variant="outline" className="text-xs font-semibold text-primary">
            <Radio className="size-3 mr-1 animate-pulse text-emerald-600" /> {t("liveGPSDispatch")}
          </Badge>
        </div>

        <DynamicFoodMap
          markers={donorMarkers}
          center={[organisation.latitude, organisation.longitude]}
          zoom={13}
          height="420px"
        />
      </section>

      {/* Main Grid: Priority Queue & Recent Listings */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Area */}
        <motion.div variants={itemAnim} className="space-y-8 lg:col-span-2">
          {/* Priority Queue */}
          <section aria-labelledby="priority-heading" className="space-y-4">
            <div className="flex items-center gap-2">
              <ListOrdered className="size-5 text-signal-high" aria-hidden />
              <h2 id="priority-heading" className="text-lg font-bold tracking-tight text-foreground">
                {t("feat3Title")}
              </h2>
            </div>

            {queue.length > 0 ? (
              <PriorityQueue items={queue} />
            ) : (
              <EmptyState
                icon={ListOrdered}
                title={t("dashTitle")}
                description={t("dashSub")}
                action={
                  <Button asChild>
                    <Link href="/donations/new">
                      <Plus className="size-4" aria-hidden />
                      {t("btnNewDonation")}
                    </Link>
                  </Button>
                }
              />
            )}
          </section>
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={itemAnim} className="space-y-8">
          <section aria-labelledby="recent-heading" className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 id="recent-heading" className="text-lg font-bold tracking-tight text-foreground">
                {t("donationsTitle")}
              </h2>
              <Button asChild variant="ghost" size="sm" className="font-semibold text-primary">
                <Link href="/donations">{t("filterAll")}</Link>
              </Button>
            </div>

            {recent.length > 0 ? (
              <ul className="space-y-3">
                {recent.map((item) => (
                  <li key={item.donation.id}>
                    <DonationCard item={item} showDonor={false} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={PackageSearch}
                title={t("donationsSub")}
                description={t("ctaSub")}
              />
            )}
          </section>
        </motion.div>
      </div>
    </motion.div>
  );
}
