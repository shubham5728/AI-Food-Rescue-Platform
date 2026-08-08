"use client";

import { KeyRound, Loader2, QrCode, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, RequestError } from "@/lib/client-api";
import { cn } from "@/lib/utils";

/**
 * AI feature #9 on screen — the pickup handshake.
 *
 * The asymmetry is the whole design: whoever is holding the food issues the
 * code, and the other party types it in. A single button that says "mark
 * collected" proves nothing; this proves the two of them were in the same
 * place at the same time.
 */

type Stage = "collection" | "delivery";

interface StageState {
  issued: boolean;
  verified: boolean;
  expires_at: string | null;
}

interface PickupVerificationProps {
  donationId: string;
  /** Which side of the handover the viewer is on. */
  role: "issuer" | "redeemer";
  stage: Stage;
  state: StageState;
  className?: string;
}

const STAGE_COPY: Record<Stage, { title: string; issuer: string; redeemer: string }> = {
  collection: {
    title: "Collection code",
    issuer:
      "Show this to the collector when they arrive. They type it in to mark the food picked up.",
    redeemer:
      "Ask the donor for their collection code and enter it here to confirm you have the food.",
  },
  delivery: {
    title: "Delivery code",
    issuer:
      "Read this out once the food arrives. It confirms delivery and releases the impact figures.",
    redeemer:
      "Enter the code from the receiving organisation to confirm the food was handed over.",
  },
};

export function PickupVerification({
  donationId,
  role,
  stage,
  state,
  className,
}: PickupVerificationProps) {
  const router = useRouter();
  const copy = STAGE_COPY[stage];

  const [code, setCode] = useState("");
  const [issued, setIssued] = useState<{ code: string; qr_payload: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.verified) {
    return (
      <Card className={cn("border-signal-low/40", className)}>
        <CardContent className="flex items-center gap-3 py-4">
          <ShieldCheck className="size-5 shrink-0 text-signal-low" aria-hidden />
          <div>
            <p className="text-sm font-medium">{copy.title} confirmed</p>
            <p className="text-xs text-muted-foreground">
              This step of the handover is verified.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const issue = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await apiRequest<{ code: string; qr_payload: string }>(
        `/api/donations/${donationId}/verify`,
        { method: "PUT", body: JSON.stringify({ stage }) },
      );
      setIssued(response);
      toast.success("Code issued");
    } catch (err) {
      const message =
        err instanceof RequestError ? err.message : "Could not issue a code.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const redeem = async () => {
    if (!code.trim()) {
      setError("Enter the code you were given");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await apiRequest(`/api/donations/${donationId}/verify`, {
        method: "POST",
        body: JSON.stringify({ stage, code: code.trim() }),
      });
      toast.success("Verified — you can now advance the status");
      setCode("");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof RequestError ? err.message : "Could not verify that code.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="border-b border-border bg-muted/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-primary" aria-hidden />
            {copy.title}
          </CardTitle>
          <Badge variant={state.issued ? "info" : "secondary"}>
            {state.issued ? "Awaiting confirmation" : "Not issued"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {role === "issuer" ? copy.issuer : copy.redeemer}
        </p>
      </CardHeader>

      <CardContent className="pt-5">
        {role === "issuer" ? (
          issued ? (
            <div className="space-y-3">
              <p
                className="tabular rounded-lg border border-dashed border-primary/40 bg-primary-soft/50 py-4 text-center text-4xl font-semibold tracking-[0.3em] text-primary"
                aria-label={`Code ${issued.code.split("").join(" ")}`}
              >
                {issued.code}
              </p>
              <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <QrCode className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                <span className="break-all">
                  QR payload: <code>{issued.qr_payload}</code>
                </span>
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void issue()}
                disabled={busy}
              >
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                Issue a new code
              </Button>
            </div>
          ) : (
            <Button type="button" onClick={() => void issue()} disabled={busy}>
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <KeyRound className="size-4" aria-hidden />
              )}
              Issue {stage} code
            </Button>
          )
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`code-${stage}`}>Six-digit code</Label>
              <Input
                id={`code-${stage}`}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                value={code}
                aria-invalid={Boolean(error)}
                className="tabular text-lg tracking-[0.3em]"
                onChange={(event) => {
                  setCode(event.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
            <Button type="button" onClick={() => void redeem()} disabled={busy}>
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <ShieldCheck className="size-4" aria-hidden />
              )}
              Confirm {stage}
            </Button>
          </div>
        )}

        {error ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
