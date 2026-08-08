import { Check, XCircle } from "lucide-react";

import { STATUS_FLOW, STATUS_LABELS } from "@/lib/constants";
import { STATUS_ICONS } from "@/lib/signals";
import type { DonationStatus, DonationStatusHistory } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

interface StatusTimelineProps {
  status: DonationStatus;
  history: DonationStatusHistory[];
  className?: string;
}

/**
 * The donation lifecycle: Available -> Matched -> Pickup Scheduled ->
 * Picked Up -> Delivered. Steps already reached carry their real timestamp
 * from the history table, so this is an audit trail rather than a decoration.
 */
export function StatusTimeline({ status, history, className }: StatusTimelineProps) {
  const cancelled = status === "cancelled";
  const currentIndex = cancelled ? -1 : STATUS_FLOW.indexOf(status);

  const timestamps = new Map<DonationStatus, string>();
  for (const entry of history) {
    if (!timestamps.has(entry.status)) timestamps.set(entry.status, entry.created_at);
  }

  return (
    <ol className={cn("relative space-y-0", className)}>
      {STATUS_FLOW.map((step, index) => {
        const reached = !cancelled && index <= currentIndex;
        const isCurrent = !cancelled && index === currentIndex;
        const isLast = index === STATUS_FLOW.length - 1;
        const Icon = STATUS_ICONS[step];
        const at = timestamps.get(step);

        return (
          <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast ? (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 rounded-full",
                  reached && index < currentIndex ? "bg-primary" : "bg-border",
                )}
              />
            ) : null}

            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                reached
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground",
                isCurrent && "ring-4 ring-primary/20",
              )}
            >
              {reached && !isCurrent ? (
                <Check className="size-4" aria-hidden />
              ) : (
                <Icon className="size-4" aria-hidden />
              )}
            </span>

            <div className="min-w-0 pt-1">
              <p
                className={cn(
                  "text-sm font-medium leading-none",
                  reached ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {STATUS_LABELS[step]}
                {isCurrent ? (
                  <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-primary">
                    Current
                  </span>
                ) : null}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {at ? formatDateTime(at) : "Not yet reached"}
              </p>
            </div>
          </li>
        );
      })}

      {cancelled ? (
        <li className="relative flex gap-4">
          <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-destructive bg-destructive text-destructive-foreground">
            <XCircle className="size-4" aria-hidden />
          </span>
          <div className="pt-1">
            <p className="text-sm font-medium leading-none text-destructive">
              Cancelled
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {timestamps.get("cancelled")
                ? formatDateTime(timestamps.get("cancelled")!)
                : "This donation was withdrawn"}
            </p>
          </div>
        </li>
      ) : null}
    </ol>
  );
}
