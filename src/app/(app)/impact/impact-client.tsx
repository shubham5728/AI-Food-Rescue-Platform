"use client";

import {
  CheckCircle2,
  Flame,
  Info,
  Leaf,
  PackageSearch,
  Radio,
  TrendingDown,
  Users,
  Utensils,
} from "lucide-react";

import { AiPerformancePanel } from "@/components/ai-performance-panel";
import { ImpactChart } from "@/components/impact-chart";
import { StatTile } from "@/components/stat-tile";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type {
  AiPerformanceStats,
  ImpactBreakdown,
  ImpactStats,
  ImpactTimePoint,
} from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

/**
 * Impact reporting.
 *
 * Every figure on this page is computed from stored donations. There is no
 * illustrative content: if a number cannot be derived from the database it is
 * not shown, and the one estimate (carbon) is displayed with its conversion
 * factor and range so a reader can check the arithmetic rather than take it on
 * trust. An impact page that cannot be audited is worth nothing to the
 * organisations whose names are on it.
 */

interface ImpactClientProps {
  stats: ImpactStats;
  timeline: ImpactTimePoint[];
  breakdown: ImpactBreakdown;
  performance: AiPerformanceStats;
}

const CATEGORY_COLOURS = [
  "var(--chart-meals)",
  "var(--chart-kg)",
  "var(--chart-completed)",
  "var(--chart-risk)",
  "hsl(var(--signal-info))",
  "hsl(var(--muted-foreground))",
];

function reportingPeriod(first: string | null): string {
  if (!first) return "No completed donations yet";
  const from = new Date(first);
  return `Reporting period: ${from.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} to today`;
}

export function ImpactClient({
  stats,
  timeline,
  breakdown,
  performance,
}: ImpactClientProps) {
  const { environmental } = breakdown;

  return (
    <div className="container space-y-8 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Impact
        </h1>
        <p className="mt-1.5 max-w-3xl text-muted-foreground">
          Derived from donations that reached{" "}
          <span className="font-medium text-foreground">Delivered</span>. Nothing
          is counted on the promise of a pickup, and nothing on this page is
          illustrative.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {reportingPeriod(breakdown.first_delivery)}
        </p>
      </header>

      {/* -- Headline ------------------------------------------------------ */}
      <section aria-label="Headline impact">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile
            label="Meals rescued"
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
            hint="Estimated mass kept out of the waste stream"
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
            hint="Derived at two meals per person"
          />
          <StatTile
            label="Rescue success rate"
            value={stats.rescue_success_rate}
            unit="%"
            icon={TrendingDown}
            accent="var(--chart-meals)"
            hint={`${formatNumber(stats.meals_lost)} meals lost to cancellation`}
          />
          <StatTile
            label="Open right now"
            value={stats.active_donations}
            icon={Radio}
            accent="var(--chart-risk)"
            hint={`${formatNumber(stats.meals_at_risk)} meals in ${stats.high_risk_donations} high-risk donations`}
          />
        </div>
      </section>

      {/* -- Time series --------------------------------------------------- */}
      <ImpactChart data={timeline} />

      {/* -- Where the food went ------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle>What was rescued</CardTitle>
            <p className="text-sm text-muted-foreground">
              Rescued meals by food category.
            </p>
          </CardHeader>
          <CardContent className="pt-5">
            {breakdown.by_category.length > 0 ? (
              <ul className="space-y-3.5">
                {breakdown.by_category.map((c, i) => (
                  <li key={c.key}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              CATEGORY_COLOURS[i % CATEGORY_COLOURS.length],
                          }}
                          aria-hidden
                        />
                        <span className="truncate font-medium">{c.label}</span>
                      </span>
                      <span className="tabular shrink-0 text-muted-foreground">
                        {formatNumber(c.meals)} meals · {formatNumber(c.kg)} kg ·{" "}
                        <span className="font-medium text-foreground">
                          {c.share}%
                        </span>
                      </span>
                    </div>
                    {/* Colour carries the category identity, so it is set per
                        row rather than through a utility class. */}
                    <div
                      className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                      role="img"
                      aria-label={`${c.label}: ${c.share}% of rescued meals`}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${c.share}%`,
                          backgroundColor:
                            CATEGORY_COLOURS[i % CATEGORY_COLOURS.length],
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No completed donations yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle>Where it went</CardTitle>
            <p className="text-sm text-muted-foreground">
              Receiving organisations by meals actually delivered.
            </p>
          </CardHeader>
          <CardContent className="pt-5">
            {breakdown.by_recipient.length > 0 ? (
              <ContributionTable
                rows={breakdown.by_recipient.slice(0, 6)}
                unitLabel="received"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No donations have been delivered yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* -- Donors + lifecycle -------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle>Contributing donors</CardTitle>
            <p className="text-sm text-muted-foreground">
              Completion rate is delivered donations as a share of the ones they
              finished — cancellations included.
            </p>
          </CardHeader>
          <CardContent className="pt-5">
            {breakdown.by_donor.length > 0 ? (
              <ContributionTable
                rows={breakdown.by_donor.slice(0, 6)}
                unitLabel="donated"
              />
            ) : (
              <p className="text-sm text-muted-foreground">No donors yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle>Lifecycle</CardTitle>
            <p className="text-sm text-muted-foreground">
              Where every donation currently sits.
            </p>
          </CardHeader>
          <CardContent className="pt-5">
            <ul className="space-y-2.5">
              {breakdown.lifecycle.map((stage) => (
                <li
                  key={stage.status}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 truncate">{stage.label}</span>
                  <span className="tabular shrink-0 text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {formatNumber(stage.count)}
                    </span>{" "}
                    {stage.count === 1 ? "donation" : "donations"}
                    {stage.meals > 0
                      ? ` · ${formatNumber(stage.meals)} meals`
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* -- AI performance ------------------------------------------------ */}
      <AiPerformancePanel performance={performance} stats={stats} />

      {/* -- Environmental estimate ---------------------------------------- */}
      <Card>
        <CardHeader className="border-b border-border bg-muted/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Leaf className="size-4 text-signal-low" aria-hidden />
              Estimated emissions avoided
            </CardTitle>
            <Badge variant="medium">
              <Info className="size-3.5" aria-hidden />
              Estimate, not a measurement
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="tabular text-3xl font-semibold tracking-tight text-signal-low">
              {formatNumber(environmental.co2e_kg)}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              kg CO₂e
            </span>
            <span className="tabular text-sm text-muted-foreground">
              (range {formatNumber(environmental.co2e_low)}–
              {formatNumber(environmental.co2e_high)})
            </span>
          </div>

          <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
            {formatNumber(environmental.food_kg)} kg of food diverted from
            landfill, at{" "}
            <span className="tabular font-medium text-foreground">
              {environmental.factor} kg CO₂e per kg
            </span>
            . {environmental.factor_source}; published values range from{" "}
            {environmental.factor_low} to {environmental.factor_high} depending
            on food mix and whether the landfill captures gas, which is why a
            range is shown rather than a single confident figure.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ContributionTable({
  rows,
  unitLabel,
}: {
  rows: ImpactBreakdown["by_donor"];
  unitLabel: string;
}) {
  const peak = Math.max(1, ...rows.map((r) => r.meals));

  return (
    <ul className="space-y-3.5">
      {rows.map((row) => (
        <li key={row.id}>
          <div className="flex items-baseline justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{row.name}</p>
              {row.locality ? (
                <p className="truncate text-xs text-muted-foreground">
                  {row.locality}
                </p>
              ) : null}
            </div>
            <div className="shrink-0 text-right">
              <p className="tabular text-sm font-medium">
                {formatNumber(row.meals)} meals
              </p>
              <p className="tabular text-xs text-muted-foreground">
                {row.donations} {unitLabel}
                {row.completion_rate < 100 ? (
                  <span
                    className={cn(
                      "ml-1.5",
                      row.completion_rate < 80 && "text-signal-medium",
                    )}
                  >
                    · {row.completion_rate}% completed
                  </span>
                ) : null}
              </p>
            </div>
          </div>
          <Progress
            value={(row.meals / peak) * 100}
            className="mt-1.5 h-1.5"
            indicatorClassName="bg-primary"
          />
        </li>
      ))}
    </ul>
  );
}
