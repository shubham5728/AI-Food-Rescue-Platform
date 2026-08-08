import { Brain, Filter, Sparkles, Target, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AiPerformanceStats, ImpactStats } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

/**
 * AI feature #10 — how well the AI layer is actually doing.
 *
 * Deliberately not a wall of green. `top_pick_acceptance` is the number worth
 * arguing with: if recipients keep accepting the engine's second or third
 * choice, the ranking is not modelling what they care about. A dashboard that
 * only reports its own successes teaches nobody anything.
 */

function Metric({
  label,
  value,
  suffix,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: number;
  suffix?: string;
  hint: string;
  tone?: "good" | "warn" | "neutral";
}) {
  const bar =
    tone === "good"
      ? "bg-signal-low"
      : tone === "warn"
        ? "bg-signal-medium"
        : "bg-signal-info";

  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 flex items-baseline gap-1">
        <span className="tabular text-2xl font-semibold tracking-tight">
          {formatNumber(value)}
        </span>
        {suffix ? (
          <span className="text-sm text-muted-foreground">{suffix}</span>
        ) : null}
      </p>
      {suffix === "%" ? (
        <Progress value={value} className="mt-2 h-1.5" indicatorClassName={bar} />
      ) : null}
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function AiPerformancePanel({
  performance,
  stats,
}: {
  performance: AiPerformanceStats;
  stats: ImpactStats;
}) {
  const topPickTone =
    performance.top_pick_acceptance >= 60
      ? "good"
      : performance.top_pick_acceptance >= 35
        ? "warn"
        : "warn";

  return (
    <Card>
      <CardHeader className="border-b border-border bg-muted/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Brain className="size-4 text-signal-info" aria-hidden />
            AI performance
          </CardTitle>
          <Badge variant="secondary">
            <Sparkles className="size-3.5" aria-hidden />
            {formatNumber(performance.analysed_donations)} donations analysed
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Whether the matching engine is recommending what people actually
          choose — not just how often it ran.
        </p>
      </CardHeader>

      <CardContent className="pt-5">
        {performance.analysed_donations === 0 ? (
          <p className="flex items-start gap-2.5 rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            <Target className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              No donations have been through the AI pipeline yet, so there is
              nothing to measure. These figures fill in as donations are created
              and analysed — showing zeroes here would imply the engine performed
              badly rather than that it has not run.
            </span>
          </p>
        ) : (
        <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Metric
            label="Top pick accepted"
            value={performance.top_pick_acceptance}
            suffix="%"
            tone={topPickTone}
            hint="How often the recipient who accepted was the engine's first-ranked choice. Low here means the ranking is missing something."
          />
          <Metric
            label="Match coverage"
            value={performance.match_coverage}
            suffix="%"
            tone="good"
            hint="Donations where at least one recipient cleared every hard constraint."
          />
          <Metric
            label="High-risk saves"
            value={performance.high_risk_save_rate}
            suffix="%"
            tone="good"
            hint="Donations flagged HIGH waste risk that still reached a recipient."
          />
          <Metric
            label="Average accepted score"
            value={performance.average_accepted_score}
            suffix="/ 100"
            hint="Mean match score of the recipients who actually accepted."
          />
          <Metric
            label="Filtered out per donation"
            value={performance.average_filtered_out}
            hint="Recipients removed by hard constraints before any scoring happened."
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <p className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm">
            <Users className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span>
              <span className="tabular font-semibold">{stats.active_donors}</span>{" "}
              donors ·{" "}
              <span className="tabular font-semibold">
                {stats.active_recipients}
              </span>{" "}
              recipients active
            </span>
          </p>
          <p className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm">
            <Filter className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span>
              <span className="tabular font-semibold">
                {performance.explained_by_llm}
              </span>{" "}
              explained by GPT ·{" "}
              <span className="tabular font-semibold">
                {performance.explained_by_engine}
              </span>{" "}
              by the engine
            </span>
          </p>
          <p
            className={cn(
              "flex items-center gap-2 rounded-lg p-3 text-sm",
              stats.meals_lost > 0 ? "bg-signal-critical/[0.08]" : "bg-muted/50",
            )}
          >
            <TrendingUp className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span>
              <span className="tabular font-semibold">
                {formatNumber(stats.meals_lost)}
              </span>{" "}
              meals lost to cancellation
            </span>
          </p>
        </div>

        {performance.top_pick_acceptance < 60 ? (
          <p className="mt-4 flex items-start gap-2.5 rounded-lg border border-signal-medium/30 bg-signal-medium/[0.07] p-3.5 text-sm">
            <Target
              className="mt-0.5 size-4 shrink-0 text-signal-medium"
              aria-hidden
            />
            <span>
              Recipients accept the top-ranked match{" "}
              {performance.top_pick_acceptance}% of the time. Below about 60% it
              is worth checking whether distance or pickup lead time is weighted
              the way collectors actually experience them.
            </span>
          </p>
        ) : null}
        </>
        )}
      </CardContent>
    </Card>
  );
}
