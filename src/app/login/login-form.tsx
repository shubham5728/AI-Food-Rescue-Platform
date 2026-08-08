"use client";

import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogIn,
  Mail,
  RotateCcw,
  Sparkles,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { apiRequest, RequestError } from "@/lib/client-api";
import type { DEMO_ACCOUNTS } from "@/lib/db/seed";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type DemoAccount = (typeof DEMO_ACCOUNTS)[number];

interface SendOtpResponse {
  success: boolean;
  hasRealSmtp: boolean;
  isEmailSent: boolean;
  message: string;
  simulatedInbox?: {
    to: string;
    subject: string;
    code: string;
  } | null;
}

export function LoginForm({
  accounts,
  className,
}: {
  accounts: DemoAccount[];
  className?: string;
}) {
  const router = useRouter();
  const { t } = useLanguage();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Email Inbox Simulation state
  const [simulatedData, setSimulatedData] = useState<SendOtpResponse["simulatedInbox"]>(null);
  const [isEmailSentReal, setIsEmailSentReal] = useState<boolean>(false);
  const [showInboxPreview, setShowInboxPreview] = useState<boolean>(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleSendOtp = async (targetEmail: string) => {
    if (!targetEmail.trim()) {
      setError("Please enter your registered organisation email");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const res = await apiRequest<SendOtpResponse>("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: targetEmail.trim() }),
      });

      setEmail(targetEmail.trim());
      setOtpDigits(["", "", "", ""]);
      setStep("otp");
      setPending(false);
      setIsEmailSentReal(res.isEmailSent);
      setSimulatedData(res.simulatedInbox || null);
      setShowInboxPreview(false);

      if (res.isEmailSent) {
        toast.success(`✉️ Real Email Sent to ${targetEmail.trim()}! Please check your Gmail/Email inbox.`, {
          duration: 9000,
        });
      } else {
        toast.info(`📩 Verification code generated for ${targetEmail.trim()}. Open simulated inbox below.`, {
          duration: 9000,
        });
      }

      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    } catch (err) {
      const message =
        err instanceof RequestError
          ? err.message
          : "Could not send verification code. Please check your email.";
      setError(message);
      setPending(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.slice(0, 4).split("");
      const newDigits = ["", "", "", ""];
      digits.forEach((d, i) => {
        if (i < 4) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      if (digits.length === 4) {
        inputRefs[3].current?.focus();
        void verifyOtp(newDigits.join(""));
      }
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setError(null);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (newDigits.every((d) => d !== "") && newDigits.join("").length === 4) {
      void verifyOtp(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const autoFillSimulatedCode = () => {
    if (!simulatedData?.code) return;
    const digits = simulatedData.code.split("");
    setOtpDigits(digits);
    inputRefs[3].current?.focus();
    void verifyOtp(simulatedData.code);
  };

  const verifyOtp = async (codeToTest: string) => {
    if (codeToTest.length !== 4) {
      setError("Please enter the complete 4-digit code sent to your email.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, otpCode: codeToTest }),
      });
      toast.success("✅ 4-Digit code verified! Signed in successfully");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof RequestError
          ? err.message
          : "Invalid 4-digit code. Please check your email inbox.";
      setError(message);
      setPending(false);
      toast.error(message);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {step === "email" ? (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void handleSendOtp(email.trim());
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5 font-medium">
              <Mail className="size-4 text-primary" aria-hidden />
              Organisation Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="kitchen@agashiye.demo"
              value={email}
              disabled={pending}
              aria-invalid={Boolean(error)}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(null);
              }}
            />
            {error ? (
              <p role="alert" className="text-sm text-destructive font-medium">
                {error}
              </p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <LogIn className="size-4" aria-hidden />
            )}
            Send 4-Digit Code to Email
          </Button>
        </form>
      ) : (
        <div className="space-y-5 rounded-xl border border-primary/20 bg-card p-5 shadow-sm">
          {/* OTP Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge variant="outline" className="mb-1.5 border-primary/30 text-primary">
                <KeyRound className="size-3" aria-hidden />
                {isEmailSentReal ? "Real Email Sent to Inbox" : "Email Code Generated"}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Code sent to <span className="font-semibold text-foreground">{email}</span>
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep("email");
                setError(null);
              }}
              className="text-xs text-muted-foreground"
            >
              <ArrowLeft className="size-3" /> Change Email
            </Button>
          </div>

          {/* Real Email Sent vs Simulated Inbox Banner */}
          {isEmailSentReal ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center gap-3">
              <Mail className="size-5 shrink-0 text-emerald-600 animate-pulse" />
              <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed font-medium">
                ✉️ Real email delivered to <strong>{email}</strong>! Please open your Gmail or Email app to get the 4-digit code.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
                  <Mail className="size-4 text-amber-600" />
                  Email Dispatch Inbox Simulator
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInboxPreview(!showInboxPreview)}
                  className="h-6 px-2 text-[11px] text-amber-700 hover:bg-amber-500/20"
                >
                  {showInboxPreview ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                  {showInboxPreview ? "Hide Email" : "Open Email"}
                </Button>
              </div>

              {showInboxPreview && simulatedData ? (
                <div className="mt-2 rounded-md border border-amber-500/20 bg-background p-3 text-xs space-y-1.5 shadow-inner">
                  <p className="font-semibold text-foreground border-b pb-1">
                    📩 {simulatedData.subject}
                  </p>
                  <p className="text-muted-foreground">To: {simulatedData.to}</p>
                  <div className="flex items-center justify-between bg-muted/60 p-2 rounded-md mt-1">
                    <span>4-Digit OTP: <strong className="text-base font-mono text-primary font-bold">{simulatedData.code}</strong></span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={autoFillSimulatedCode}
                      className="h-6 text-[11px] bg-primary text-primary-foreground"
                    >
                      <Sparkles className="size-3" /> Auto-fill
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  Click <strong>"Open Email"</strong> above to view the email sent to {email}.
                </p>
              )}
            </div>
          )}

          {/* 4 Digit Input Boxes */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-center block text-muted-foreground">
              Enter 4-Digit Verification Code
            </Label>
            <div className="flex justify-center gap-3 py-1">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={digit}
                  disabled={pending}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="size-14 text-center text-2xl font-bold font-mono rounded-xl border-2 border-input bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-60"
                />
              ))}
            </div>
            {error ? (
              <p role="alert" className="text-center text-xs text-destructive font-medium">
                {error}
              </p>
            ) : null}
          </div>

          {/* Submit / Resend Controls */}
          <div className="space-y-2 pt-2">
            <Button
              type="button"
              className="w-full"
              size="lg"
              disabled={pending || otpDigits.some((d) => !d)}
              onClick={() => verifyOtp(otpDigits.join(""))}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Verify 4-Digit Code & Sign In
            </Button>

            <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
              <button
                type="button"
                disabled={pending}
                onClick={() => void handleSendOtp(email)}
                className="flex items-center gap-1 font-medium text-primary hover:underline disabled:opacity-50"
              >
                <RotateCcw className="size-3" /> Resend Code to Email
              </button>
              <span>Code expires in 5:00</span>
            </div>
          </div>
        </div>
      )}

      {/* Demo Accounts List */}
      {accounts.length > 0 && step === "email" ? (
        <>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Or select an Ahmedabad organisation
            </span>
            <Separator className="flex-1" />
          </div>

          <ul className="space-y-2">
            {accounts.map((account) => {
              const Icon = account.role === "donor" ? Store : Building2;
              return (
                <li key={account.email}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => void handleSendOtp(account.email)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        account.role === "donor"
                          ? "bg-accent-soft text-accent"
                          : "bg-primary-soft text-primary",
                      )}
                      aria-hidden
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {account.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {account.blurb}
                      </span>
                    </span>
                    <span className="ml-auto text-xs font-semibold text-primary">
                      Send Email Code →
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        New organisation?{" "}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create a profile
        </Link>
      </p>
    </div>
  );
}
