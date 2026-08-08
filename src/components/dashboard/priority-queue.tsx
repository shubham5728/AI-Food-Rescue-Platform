import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

import { PriorityBadge, RiskBadge } from "@/components/signal-badges";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PRIORITY_STYLES } from "@/lib/signals";
import type { ScoredDonation } from "@/lib/service";
import { cn, formatDuration, formatNumber } from "@/lib/utils";

/**
 * AI feature #3 on screen: the ordered work list.
 *
 * Each row carries the score, the band, and the sentence explaining the
 * position — the ranking is only useful if a coordinator can see why the top
 * item is on top.
 */
export function PriorityQueue({
  items,
  limit = 5,
}: {
  items: ScoredDonation[];
  limit?: number;
}) {
  return (
    <ol className="space-y-3">
      {items.slice(0, limit).map((item, index) => {
        const { donation, risk, priority } = item;
        const style = PRIORITY_STYLES[priority.level];
        const overdue = risk.minutes_remaining < 0;

        return (
          <li key={donation.id}>
            <Card
              className={cn(
                "group relative p-4 transition-shadow hover:shadow-lift",
                index === 0 && priority.level === "CRITICAL" &&
                  "border-signal-critical/35 ring-1 ring-signal-critical/15",
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex w-12 shrink-0 flex-col items-center">
                  <span
                    className={cn(
                      "tabular text-2xl font-semibold leading-none",
                      style.text,
                    )}
                  >
                    {priority.score}
                  </span>
                  <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    / 100
                  </span>
                  <Progress
                    value={priority.score}
                    className="mt-2 h-1"
                    indicatorClassName={style.bar}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="truncate text-sm font-semibold leading-tight">
                      <Link
                        href={`/donations/${donation.id}`}
                        className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {donation.food_name}
                      </Link>
                    </h3>
                    <span className="tabular text-xs text-muted-foreground">
                      {formatNumber(donation.meals)} meals
                    </span>
                  </div>

                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                    {donation.priority_reason || priority.reason}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <PriorityBadge level={priority.level} />
                    <RiskBadge level={risk.level} score={risk.score} />
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs",
                        overdue ? "text-signal-critical" : "text-muted-foreground",
                      )}
                    >
                      <Clock className="size-3" aria-hidden />
                      {overdue
                        ? formatDuration(risk.minutes_remaining)
                        : `${formatDuration(risk.minutes_remaining)} left`}
                    </span>
                  </div>
                </div>

                <ArrowRight
                  className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </div>
            </Card>
          </li>
        );
      })}
    </ol>
  );
}
