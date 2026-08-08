"use client";

import {
  CheckCircle2,
  Flame,
  PackageSearch,
  Radio,
  Users,
  Utensils,
} from "lucide-react";

import { ImpactChart } from "@/components/impact-chart";
import { StatTile } from "@/components/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/context";
import type { ImpactStats, ImpactTimePoint } from "@/lib/types";

interface ImpactClientProps {
  stats: ImpactStats;
  timeline: ImpactTimePoint[];
}

export function ImpactClient({ stats, timeline }: ImpactClientProps) {
  const { t } = useLanguage();

  return (
    <div className="container space-y-7 py-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("impactTitle")}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {t("impactSub")}
        </p>
      </header>

      <section aria-label="Headline impact">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            label={t("statusDelivered")}
            value={stats.donations_completed}
            icon={CheckCircle2}
            accent="var(--chart-completed)"
            hint="Successful rescues"
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
            unit="meals"
            icon={Flame}
            accent="var(--chart-risk)"
            hint={`${stats.high_risk_donations} ${t("riskHigh").toLowerCase()}`}
          />
          <StatTile
            label={t("statusPending")}
            value={stats.active_donations}
            icon={Radio}
            accent="var(--chart-meals)"
            hint="Active surplus listings"
          />
        </div>
      </section>

      <ImpactChart data={timeline} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t("impactTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs sm:text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">{t("mealsDonated")}</span> &{" "}
            <span className="font-medium text-foreground">{t("foodSaved")}</span> measure verified food rescues delivered to local shelters in real-time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
