import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: number;
  unit?: string;
  icon: LucideIcon;
  /** CSS colour for the icon chip — a chart token or a signal colour. */
  accent: string;
  hint?: string;
  emphasis?: boolean;
  className?: string;
}

/**
 * A single headline number. Deliberately not a chart: these are magnitudes
 * read one at a time, and a sparkline behind each would add ink without
 * adding an answer.
 */
export function StatTile({
  label,
  value,
  unit,
  icon: Icon,
  accent,
  hint,
  emphasis = false,
  className,
}: StatTileProps) {
  return (
    <Card
      className={cn(
        "flex flex-col justify-between gap-3 p-4 transition-shadow hover:shadow-lift",
        emphasis && "ring-1 ring-primary/25",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)` }}
          aria-hidden
        >
          <Icon className="size-4" style={{ color: accent }} />
        </span>
      </div>

      <div>
        <p className="flex items-baseline gap-1.5">
          <span className="text-3xl font-semibold leading-none tracking-tight">
            {formatNumber(value)}
          </span>
          {unit ? (
            <span className="text-sm font-medium text-muted-foreground">{unit}</span>
          ) : null}
        </p>
        {hint ? (
          <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </Card>
  );
}
