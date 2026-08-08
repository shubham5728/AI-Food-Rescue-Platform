"use client";

import {
  ArrowLeft,
  Building2,
  CheckCircle2,
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
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleSendOtp = (targetEmail: string) => {
    if (!targetEmail.trim()) {
      setError("Please enter your registered organisation email");
      return;
    }

    // Generate random 4-digit OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setEmail(targetEmail);
    setError(null);
    setOtpDigits(["", "", "", ""]);
    setStep("otp");

    toast.success(`📩 Verification code sent! Your 4-digit OTP is ${code}`, {
      duration: 10000,
    });

    // Auto-focus first digit input
    setTimeout(() => {
      inputRefs[0].current?.focus();
    }, 100);
  };

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // User pasted full 4-digit code
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

    // Auto-advance to next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // If 4 digits filled, auto verify
    if (newDigits.every((d) => d !== "") && newDigits.join("").length === 4) {
      void verifyOtp(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const autoFillCode = () => {
    if (!generatedOtp) return;
    const digits = generatedOtp.split("");
    setOtpDigits(digits);
    inputRefs[3].current?.focus();
    void verifyOtp(generatedOtp);
  };

  const verifyOtp = async (codeToTest: string) => {
    if (codeToTest !== generatedOtp) {
      setError("Incorrect 4-digit code. Please try again.");
      toast.error("Invalid verification code");
      return;
    }

    setPending(email);
    setError(null);
    try {
      await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      toast.success("✅ Code verified! Signed in successfully");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof RequestError
          ? (err.fields?.email ?? err.message)
          : "Could not sign in. Please try again.";
      setError(message);
      setPending(null);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {step === "email" ? (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            handleSendOtp(email.trim());
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5">
              <Mail className="size-4 text-primary" aria-hidden />
              Organisation email address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="kitchen@agashiye.demo"
              value={email}
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

          <Button type="submit" className="w-full" size="lg">
            <LogIn className="size-4" aria-hidden />
            Send 4-Digit Verification Code
          </Button>
        </form>
      ) : (
        <div className="space-y-5 rounded-xl border border-primary/20 bg-card p-5 shadow-sm">
          {/* OTP Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge variant="outline" className="mb-1.5 border-primary/30 text-primary">
                <KeyRound className="size-3" aria-hidden />
                4-Digit Verification Code Sent
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
              <ArrowLeft className="size-3" /> Change
            </Button>
          </div>

          {/* Generated Code Toast Notification Banner */}
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Sparkles className="size-4 shrink-0 text-emerald-600 animate-pulse" />
              <span>Your OTP Code: <strong className="text-base tracking-widest font-mono text-emerald-800 dark:text-emerald-200">{generatedOtp}</strong></span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={autoFillCode}
              className="h-7 text-xs border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/20"
            >
              Auto-fill Code
            </Button>
          </div>

          {/* 4 Digit Input Boxes */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-center block text-muted-foreground">
              Enter the 4-digit code below
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
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="size-14 text-center text-2xl font-bold font-mono rounded-xl border-2 border-input bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
              disabled={pending !== null || otpDigits.some((d) => !d)}
              onClick={() => verifyOtp(otpDigits.join(""))}
            >
              {pending !== null ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Verify & Sign In
            </Button>

            <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
              <button
                type="button"
                onClick={() => handleSendOtp(email)}
                className="flex items-center gap-1 font-medium text-primary hover:underline"
              >
                <RotateCcw className="size-3" /> Resend 4-Digit Code
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
              Or pick an Ahmedabad organisation
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
                    onClick={() => handleSendOtp(account.email)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                      Send OTP →
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

