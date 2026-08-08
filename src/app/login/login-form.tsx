"use client";

import {
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogIn,
  Mail,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (targetEmail: string) => {
    if (!targetEmail.trim()) {
      setError("Please enter your email address");
      return;
    }

    setPending(targetEmail);
    setError(null);

    try {
      await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: targetEmail.trim(), password }),
      });
      toast.success("✅ Signed in successfully!");
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
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void signIn(email.trim());
        }}
        className="space-y-4"
      >
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-1.5 font-medium">
            <Mail className="size-4 text-primary" aria-hidden />
            Email Address / User ID
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="enter your email or user ID"
            value={email}
            disabled={pending !== null}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError(null);
            }}
          />
        </div>

        {/* Password Input with Working Eye Toggle Button */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="flex items-center gap-1.5 font-medium">
              <KeyRound className="size-4 text-primary" aria-hidden />
              Password
            </Label>
          </div>
          <div className="relative flex items-center">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              disabled={pending !== null}
              onChange={(event) => setPassword(event.target.value)}
              className="pr-11"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPassword((prev) => !prev);
              }}
              className="absolute right-3 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4 text-primary font-bold" />
              ) : (
                <Eye className="size-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-destructive font-medium">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" size="lg" disabled={pending !== null}>
          {pending !== null ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <LogIn className="size-4" aria-hidden />
          )}
          Sign In
        </Button>
      </form>

      {/* Demo Accounts List */}
      {accounts.length > 0 ? (
        <>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Or 1-Click Login (Ahmedabad Demo Profiles)
            </span>
            <Separator className="flex-1" />
          </div>

          <ul className="space-y-2">
            {accounts.map((account) => {
              const Icon = account.role === "donor" ? Store : Building2;
              const isBusy = pending === account.email;
              return (
                <li key={account.email}>
                  <button
                    type="button"
                    disabled={pending !== null}
                    onClick={() => void signIn(account.email)}
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
                      {isBusy ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Icon className="size-4" />
                      )}
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
                      1-Click Sign In →
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
