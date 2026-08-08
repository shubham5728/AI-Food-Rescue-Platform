import {
  CheckCircle2,
  Flame,
  PackageSearch,
  Radio,
  Users,
  Utensils,
} from "lucide-react";
import type { Metadata } from "next";

import { ImpactChart } from "@/components/impact-chart";
import { StatTile } from "@/components/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getImpactStats, getImpactTimeline } from "@/lib/service";
import { requireSession } from "@/lib/session";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Impact" };
export const dynamic = "force-dynamic";

export default async function ImpactPage() {
  await requireSession();

  const [stats, timeline] = await Promise.all([
    getImpactStats(),
    getImpactTimeline(30),
  ]);

  return (
    <div className="container space-y-7 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Impact
        </h1>
        <p className="mt-1.5 max-w-2xl text-muted-foreground">
          Every figure below is derived from donations that actually reached{" "}
          <span className="font-medium text-foreground">Delivered</span> — nothing
          is counted on the promise of a pickup.
        </p>
      </header>

      <section aria-label="Headline impact">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile
            label="Meals donated"
            value={stats.meals_donated}
            icon={Utensils}
            accent="var(--chart-meals)"
            hint="Delivered to verified organisations"
            emphasis
          />
          <StatTile
            label="Food saved"
            value={stats.food_saved_kg}
            unit="kg"
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
            label="People served"
            value={stats.people_served}
            icon={Users}
            accent="var(--chart-completed)"
            hint="Estimated at two meals per person"
          />
          <StatTile
            label="Food at risk"
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
            <span className="font-medium text-foreground">Meals donated</span> and{" "}
            <span className="font-medium text-foreground">food saved</span> sum the
            meal count and estimated mass of every donation with status
            Delivered. A donation that is matched but not yet collected contributes
            nothing.
          </p>
          <p>
            <span className="font-medium text-foreground">People served</span> is
            derived at two meals per person, the working assumption for a single
            distribution.
          </p>
          <p>
            <span className="font-medium text-foreground">Food at risk</span> is
            recomputed on every page load: it sums the meals in open donations whose
            live waste-risk score is currently in the high band, which is why it
            moves during the day even when nothing is edited.
          </p>
          <p className="tabular">
            Current baseline: {formatNumber(stats.meals_donated)} meals across{" "}
            {formatNumber(stats.donations_completed)} completed donations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
