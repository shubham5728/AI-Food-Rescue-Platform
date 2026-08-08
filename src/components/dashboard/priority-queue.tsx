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
    <ol className="space-y-4">
      {items.slice(0, limit).map((item, index) => {
        const { donation, risk, priority } = item;
        const style = PRIORITY_STYLES[priority.level];
        const overdue = risk.minutes_remaining < 0;
        
        // Calculate visual urgency for the meter (max 240 mins for visual scale)
        const urgencyPercent = overdue ? 0 : Math.max(0, Math.min(100, (risk.minutes_remaining / 240) * 100));
        const isCritical = risk.minutes_remaining < 60;
        const isWarning = risk.minutes_remaining >= 60 && risk.minutes_remaining < 180;

        return (
          <li key={donation.id}>
            <Card
              className={cn(
                "group relative p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card/60 backdrop-blur-sm overflow-hidden",
                index === 0 && priority.level === "CRITICAL"
                  ? "border-signal-critical/40 ring-1 ring-signal-critical/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                  : "border-border/40"
              )}
            >
              <div className="flex items-start gap-5">
                <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-muted/50 p-2 border border-border/30">
                  <span
                    className={cn(
                      "tabular text-2xl font-extrabold leading-none tracking-tight",
                      style.text,
                    )}
                  >
                    {priority.score}
                  </span>
                  <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    Score
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    <h3 className="truncate text-base font-bold tracking-tight">
                      <Link
                        href={`/donations/${donation.id}`}
                        className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {donation.food_name}
                      </Link>
                    </h3>
                    <span className="tabular text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {formatNumber(donation.meals)} meals
                    </span>
                  </div>

                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {donation.priority_reason || priority.reason}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <PriorityBadge level={priority.level} />
                    
                    {/* Visual Risk Meter */}
                    <div className="flex-1 flex items-center gap-2 min-w-[120px]">
                      <Clock className={cn("size-3.5", overdue || isCritical ? "text-signal-critical animate-pulse" : isWarning ? "text-amber-500" : "text-emerald-500")} aria-hidden />
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            overdue || isCritical ? "bg-signal-critical" : isWarning ? "bg-amber-500" : "bg-emerald-500",
                            isCritical && !overdue && "animate-pulse"
                          )}
                          style={{ width: `${Math.max(5, urgencyPercent)}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          "tabular text-xs font-medium whitespace-nowrap",
                          overdue || isCritical ? "text-signal-critical" : isWarning ? "text-amber-600" : "text-emerald-600",
                        )}
                      >
                        {overdue
                          ? `${formatDuration(Math.abs(risk.minutes_remaining))} overdue`
                          : `${formatDuration(risk.minutes_remaining)} left`}
                      </span>
                    </div>
                  </div>
                </div>

                <ArrowRight
                  className="mt-2 size-5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary"
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
