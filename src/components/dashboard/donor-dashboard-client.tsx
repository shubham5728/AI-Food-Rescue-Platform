"use client";

import {
  Flame,
  ListOrdered,
  PackageSearch,
  Plus,
  Utensils,
  Users,
} from "lucide-react";
import Link from "next/link";

import { DonationCard } from "@/components/donation-card";
import { PriorityQueue } from "@/components/dashboard/priority-queue";
import { StatTile } from "@/components/stat-tile";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useLanguage } from "@/lib/i18n/context";
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

import { MapPin } from "lucide-react";
import { DynamicFoodMap, type MapMarkerItem } from "@/components/map";

export function DonorDashboardClient({
  organisation,
  stats,
  myActive,
  queue,
  recent,
}: DonorDashboardClientProps) {
  const { t } = useLanguage();

  const donorMarkers: MapMarkerItem[] = [
    {
      id: organisation.id,
      lat: organisation.latitude,
      lng: organisation.longitude,
      title: organisation.name,
      type: "donor",
      subtitle: "Your Location",
      address: organisation.address,
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

  return (
    <div className="container space-y-8 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {organisation.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {myActive.length > 0
              ? `${myActive.length} ${t("donationsTitle").toLowerCase()}`
              : t("dashSub")}
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/donations/new">
            <Plus className="size-4" aria-hidden />
            {t("btnNewDonation")}
          </Link>
        </Button>
      </header>

      <section aria-label="Impact">
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
      </section>

      {/* Live Ahmedabad Real Map */}
      <section aria-label="Live Map" className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" aria-hidden />
          <h2 className="text-lg font-semibold tracking-tight">
            Ahmedabad Live Dispatch Map
          </h2>
        </div>
        <DynamicFoodMap
          markers={donorMarkers}
          center={[organisation.latitude, organisation.longitude]}
          zoom={13}
          height="380px"
        />
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section aria-labelledby="priority-heading" className="space-y-4">
          <div className="flex items-center gap-2">
            <ListOrdered className="size-4 text-signal-high" aria-hidden />
            <h2 id="priority-heading" className="text-lg font-semibold tracking-tight">
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

        <section aria-labelledby="recent-heading" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="recent-heading" className="text-lg font-semibold tracking-tight">
              {t("donationsTitle")}
            </h2>
            <Button asChild variant="ghost" size="sm">
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
      </div>
    </div>
  );
}

