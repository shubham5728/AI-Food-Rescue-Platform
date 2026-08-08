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
import { formatNumber } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

interface ImpactClientProps {
  stats: any;
  timeline: any;
}

export function ImpactClient({ stats, timeline }: ImpactClientProps) {
  const { t } = useLanguage();

  return (
    <div className="container space-y-7 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("navImpact")}
        </h1>
        <p className="mt-1.5 max-w-2xl text-muted-foreground">
          {t("impactSubtitle")}{" "}
          <span className="font-medium text-foreground">{t("impactDelivered")}</span> — nothing
          is counted on the promise of a pickup.
        </p>
      </header>

      <section aria-label="Headline impact">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile
            label={t("mealsDonated")}
            value={stats.meals_donated}
            icon={Utensils}
            accent="var(--chart-meals)"
            hint="Delivered to verified organisations"
            emphasis
          />
          <StatTile
            label={t("foodSaved")}
            value={stats.food_saved_kg}
            unit={t("unitKg")}
            icon={PackageSearch}
            accent="var(--chart-kg)"
            hint="Kept out of the waste stream"
          />
          <StatTile
            label="Donations completed"
            value={stats.donations_completed}
            icon={CheckCircle2}
            accent="var(--chart-completed)"
            hint="Full lifecycle, available to delivered"
          />
          <StatTile
            label={t("peopleServed")}
            value={stats.people_served}
            icon={Users}
            accent="var(--chart-completed)"
            hint="Estimated at two meals per person"
          />
          <StatTile
            label={t("mealsAtRisk")}
            value={stats.meals_at_risk}
            unit="meals"
            icon={Flame}
            accent="var(--chart-risk)"
            hint={`Across ${stats.high_risk_donations} high-risk donations`}
          />
          <StatTile
            label="Active donations"
            value={stats.active_donations}
            icon={Radio}
            accent="var(--chart-meals)"
            hint="Open, matched, scheduled or collected"
          />
        </div>
      </section>

      <ImpactChart data={timeline} />

      <Card>
        <CardHeader>
          <CardTitle>How these numbers are calculated</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">{t("mealsDonated")}</span> and{" "}
            <span className="font-medium text-foreground">{t("foodSaved")}</span> sum the
            meal count and estimated mass of every donation with status
            {t("impactDelivered")}. A donation that is matched but not yet collected contributes
            nothing.
          </p>
          <p>
            <span className="font-medium text-foreground">{t("peopleServed")}</span> is
            derived at two meals per person, the working assumption for a single
            distribution.
          </p>
          <p>
            <span className="font-medium text-foreground">{t("mealsAtRisk")}</span> is
            recomputed on every page load: it sums the meals in open donations whose
            live waste-risk score is currently in the high band, which is why it
            moves during the day even when nothing is edited.
          </p>
          <p className="tabular">
            {t("impactCurrentBaseline")} {formatNumber(stats.meals_donated)} {t("impactMealsAcross")}{" "}
            {formatNumber(stats.donations_completed)} {t("impactCompletedDonations")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
