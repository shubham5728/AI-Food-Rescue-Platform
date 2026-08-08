"use client";

import {
  ArrowRight,
  Ban,
  Check,
  Loader2,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiRequest, RequestError } from "@/lib/client-api";
import { STATUS_LABELS, STATUS_TRANSITIONS } from "@/lib/constants";
import { STATUS_ICONS } from "@/lib/signals";
import type { DonationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Every control here performs a real mutation and then refreshes the server
 * components, so the risk score, priority, match list and impact tiles all
 * recompute from the new state rather than being patched client-side.
 */

function useMutation() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [isRefreshing, startTransition] = useTransition();

  const run = async (
    action: () => Promise<unknown>,
    messages: { success: string },
  ) => {
    setPending(true);
    try {
      await action();
      toast.success(messages.success);
      startTransition(() => router.refresh());
    } catch (error) {
      const message =
        error instanceof RequestError
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return { run, busy: pending || isRefreshing };
}

/* -------------------------------------------------------------------------- */

export function AcceptDonationButton({
  donationId,
  label = "Accept donation",
  className,
  size = "default",
}: {
  donationId: string;
  label?: string;
  className?: string;
  size?: "default" | "sm" | "lg";
}) {
  const { run, busy } = useMutation();

  return (
    <Button
      type="button"
      size={size}
      className={className}
      disabled={busy}
      onClick={() =>
        run(
          () =>
            apiRequest(`/api/donations/${donationId}/accept`, { method: "POST" }),
          { success: "Donation accepted — the donor has been notified." },
        )
      }
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Check className="size-4" aria-hidden />
      )}
      {busy ? "Accepting…" : label}
    </Button>
  );
}

/** Donor-side equivalent: confirm the AI's recommended recipient. */
export function ConfirmRecipientButton({
  donationId,
  recipientId,
  recipientName,
  variant = "default",
  className,
}: {
  donationId: string;
  recipientId: string;
  recipientName: string;
  variant?: "default" | "outline";
  className?: string;
}) {
  const { run, busy } = useMutation();

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={busy}
      onClick={() =>
        run(
          () =>
            apiRequest(`/api/donations/${donationId}/accept`, {
              method: "POST",
              body: JSON.stringify({ recipient_id: recipientId }),
            }),
          { success: `${recipientName} confirmed for pickup.` },
        )
      }
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Check className="size-4" aria-hidden />
      )}
      {busy ? "Confirming…" : `Confirm ${recipientName}`}
    </Button>
  );
}

/* -------------------------------------------------------------------------- */

const NEXT_STEP_LABELS: Partial<Record<DonationStatus, string>> = {
  pickup_scheduled: "Schedule pickup",
  picked_up: "Mark as picked up",
  delivered: "Mark as delivered",
  available: "Release back to available",
};

/**
 * Renders exactly the transitions the lifecycle permits from the current
 * status, so an invalid move is not merely rejected by the API — it is never
 * offered.
 */
export function StatusActions({
  donationId,
  status,
  className,
}: {
  donationId: string;
  status: DonationStatus;
  className?: string;
}) {
  const { run, busy } = useMutation();
  const allowed = STATUS_TRANSITIONS[status];

  // "matched" is reached by accepting, never by a bare status change.
  const steps = allowed.filter((s) => s !== "matched" && s !== "cancelled");
  const canCancel = allowed.includes("cancelled");

  if (steps.length === 0 && !canCancel) return null;

  const move = (next: DonationStatus, label: string) =>
    run(
      () =>
        apiRequest(`/api/donations/${donationId}/status`, {
          method: "POST",
          body: JSON.stringify({ status: next }),
        }),
      { success: `Donation moved to ${STATUS_LABELS[next]}.` },
    );

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {steps.map((next) => {
        const Icon: LucideIcon = STATUS_ICONS[next] ?? ArrowRight;
        const label = NEXT_STEP_LABELS[next] ?? `Move to ${STATUS_LABELS[next]}`;
        const isForward = next !== "available";
        return (
          <Button
            key={next}
            type="button"
            variant={isForward ? "default" : "outline"}
            disabled={busy}
            onClick={() => move(next, label)}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Icon className="size-4" aria-hidden />
            )}
            {label}
          </Button>
        );
      })}

      {canCancel ? (
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => move("cancelled", "Cancel donation")}
          className="text-muted-foreground hover:text-destructive"
        >
          <Ban className="size-4" aria-hidden />
          Cancel
        </Button>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Risk and priority are functions of the clock, so re-running matters. */
export function ReanalyseButton({
  donationId,
  className,
}: {
  donationId: string;
  className?: string;
}) {
  const { run, busy } = useMutation();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      disabled={busy}
      onClick={() =>
        run(
          () =>
            apiRequest(`/api/donations/${donationId}/reanalyse`, {
              method: "POST",
            }),
          { success: "Re-analysed against the current time." },
        )
      }
    >
      <RefreshCw className={cn("size-3.5", busy && "animate-spin")} aria-hidden />
      {busy ? "Re-analysing…" : "Re-run AI analysis"}
    </Button>
  );
}
