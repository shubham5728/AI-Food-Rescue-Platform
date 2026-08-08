"use client";

import { AlertTriangle, Clock, Leaf, Timer } from "lucide-react";
import { useEffect, useState } from "react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/**
 * Feature #3 — the Food Rescue Clock.
 *
 * The rest of the product renders time as a static string that was true when
 * the page was built. For food with ninety minutes left, that is not good
 * enough: the number has to move, because the whole point is that the window
 * is closing while you look at it.
 *
 * Two deadlines run at once and the tighter one governs:
 *
 *   pickup deadline — when the donor stops being able to hand the food over;
 *   safe-to-eat     — when the food itself is no longer servable.
 *
 * Showing only the pickup deadline would be misleading for food cooked hours
 * before its window opened.
 */

interface RescueClockProps {
  pickupDeadline: string;
  /** When the food stops being safe to serve. */
  safeUntil: string;
  /** Start of the window, used to draw how much has already elapsed. */
  windowStart: string;
  /** Settled donations freeze the clock instead of counting into the negative. */
  frozen?: boolean;
  size?: "sm" | "lg";
  className?: string;
}

type Governing = "pickup" | "freshness";

function useNow(active: boolean): number {
  // Start from a fixed value so the server and the first client render agree;
  // the interval takes over immediately afterwards.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);

  return now;
}

function splitDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function RescueClock({
  pickupDeadline,
  safeUntil,
  windowStart,
  frozen = false,
  size = "lg",
  className,
}: RescueClockProps) {
  const now = useNow(!frozen);

  const pickupMs = new Date(pickupDeadline).getTime() - now;
  const freshnessMs = new Date(safeUntil).getTime() - now;

  const governing: Governing = freshnessMs < pickupMs ? "freshness" : "pickup";
  const remainingMs = Math.min(pickupMs, freshnessMs);
  const expired = remainingMs <= 0;

  const startMs = new Date(windowStart).getTime();
  const endMs = new Date(governing === "pickup" ? pickupDeadline : safeUntil).getTime();
  const span = Math.max(1, endMs - startMs);
  const elapsedPct = Math.min(100, Math.max(0, ((now - startMs) / span) * 100));

  const { hours, minutes, seconds } = splitDuration(remainingMs);

  // Bands are about what a coordinator should do, not arbitrary thresholds:
  // under 45 minutes there is no time to arrange anything new.
  const minutesLeft = remainingMs / 60_000;
  const tone = expired
    ? "expired"
    : minutesLeft <= 45
      ? "critical"
      : minutesLeft <= 120
        ? "warning"
        : "safe";

  const toneStyles = {
    expired: { text: "text-muted-foreground", bar: "bg-muted-foreground", ring: "border-border" },
    critical: { text: "text-signal-critical", bar: "bg-signal-critical", ring: "border-signal-critical/40" },
    warning: { text: "text-signal-high", bar: "bg-signal-high", ring: "border-signal-high/40" },
    safe: { text: "text-signal-low", bar: "bg-signal-low", ring: "border-signal-low/30" },
  }[tone];

  const Icon = expired ? AlertTriangle : tone === "safe" ? Leaf : Timer;

  const label = expired
    ? governing === "freshness"
      ? "Past safe holding time"
      : "Pickup window closed"
    : governing === "freshness"
      ? "Until food is no longer safe"
      : "Until the pickup window closes";

  if (size === "sm") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-sm tabular",
          toneStyles.text,
          className,
        )}
        // The seconds tick, so announce only meaningful changes.
        aria-live="off"
      >
        <Clock className="size-3.5" aria-hidden />
        {expired ? "Expired" : `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4",
        toneStyles.ring,
        tone === "critical" && !expired && "animate-pulse-ring",
        className,
      )}
    >
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className={cn("size-4", toneStyles.text)} aria-hidden />
        Food rescue clock
      </p>

      <div
        className={cn("mt-2 flex items-baseline gap-1 tabular", toneStyles.text)}
        role="timer"
        aria-live="off"
      >
        {expired ? (
          <span className="text-3xl font-semibold tracking-tight">00:00:00</span>
        ) : (
          <>
            <span className="text-3xl font-semibold tracking-tight">
              {String(hours).padStart(2, "0")}
            </span>
            <span className="text-xl font-medium">:</span>
            <span className="text-3xl font-semibold tracking-tight">
              {String(minutes).padStart(2, "0")}
            </span>
            <span className="text-xl font-medium">:</span>
            <span className="text-3xl font-semibold tracking-tight">
              {String(seconds).padStart(2, "0")}
            </span>
          </>
        )}
      </div>

      <p className="mt-1 text-sm text-muted-foreground">{label}</p>

      <Progress
        value={elapsedPct}
        className="mt-3 h-1.5"
        indicatorClassName={toneStyles.bar}
      />

      <p className="mt-2 text-xs text-muted-foreground">
        {governing === "freshness"
          ? "Freshness is the binding limit here — the food expires before the pickup window does."
          : "The pickup window is the binding limit — the food stays safe past it."}
      </p>
    </div>
  );
}
