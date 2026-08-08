import { Check, Scissors, Split } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDistance } from "@/lib/geo";
import type { AllocationPlan } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

/**
 * AI feature #6 on screen.
 *
 * Only worth rendering when a split actually happens — telling a donor "we
 * decided not to split your 40 meals" is noise. The caller checks
 * `single_recipient` and skips it.
 */
export function AllocationPanel({ plan }: { plan: AllocationPlan }) {
  const allocatedPct =
    plan.total_meals === 0
      ? 0
      : Math.round((plan.allocated_meals / plan.total_meals) * 100);

  return (
    <Card>
      <CardHeader className="border-b border-border bg-muted/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Split className="size-4 text-primary" aria-hidden />
            Smart allocation
          </CardTitle>
          <Badge variant={plan.leftover_meals > 0 ? "medium" : "low"}>
            {plan.slices.length} recipient{plan.slices.length === 1 ? "" : "s"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{plan.explanation}</p>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="tabular text-sm">
            <span className="text-2xl font-semibold tracking-tight">
              {formatNumber(plan.allocated_meals)}
            </span>
            <span className="text-muted-foreground">
              {" "}
              of {formatNumber(plan.total_meals)} meals allocated
            </span>
          </p>
          {plan.leftover_meals > 0 ? (
            <span className="tabular text-sm font-medium text-signal-medium">
              {formatNumber(plan.leftover_meals)} unallocated
            </span>
          ) : null}
        </div>

        <Progress
          value={allocatedPct}
          className="mt-3 h-2"
          indicatorClassName={
            plan.leftover_meals > 0 ? "bg-signal-medium" : "bg-signal-low"
          }
        />

        <ul className="mt-5 space-y-3">
          {plan.slices.map((slice, index) => (
            <li
              key={slice.recipient_id}
              className="flex items-start gap-3 rounded-lg border border-border p-3"
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary-soft text-xs font-semibold text-primary"
                aria-hidden
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="truncate text-sm font-medium">
                    {slice.recipient_name}
                  </p>
                  <Badge variant="secondary">
                    <Scissors className="size-3" aria-hidden />
                    {formatNumber(slice.meals)} meals
                  </Badge>
                  <span className="tabular text-xs text-muted-foreground">
                    {slice.match_score}% match ·{" "}
                    {formatDistance(slice.distance_km)}
                  </span>
                </div>
                <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Check className="mt-0.5 size-3 shrink-0 text-signal-low" aria-hidden />
                  {slice.reason}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
