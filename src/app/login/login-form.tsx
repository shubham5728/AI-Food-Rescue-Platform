"use client";

import { Building2, Loader2, LogIn, Store } from "lucide-react";
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
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (address: string) => {
    setPending(address);
    setError(null);
    try {
      await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: address }),
      });
      toast.success("Signed in");
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
    <div className={cn("space-y-7", className)}>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!email.trim()) {
            setError("Enter the email your organisation is registered with");
            return;
          }
          void signIn(email.trim());
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Organisation email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="kitchen@greenleaf.demo"
            value={email}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "email-error" : undefined}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError(null);
            }}
          />
          {error ? (
            <p id="email-error" role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={pending !== null}>
          {pending !== null ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <LogIn className="size-4" aria-hidden />
          )}
          Sign in
        </Button>
      </form>

      {accounts.length > 0 ? (
        <>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Or use a demo organisation
            </span>
            <Separator className="flex-1" />
          </div>

          <ul className="space-y-2">
            {accounts.map((account) => {
              const Icon = account.role === "donor" ? Store : Building2;
              const busy = pending === account.email;
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
                      {busy ? (
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
                    <span className="ml-auto text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {account.role}
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
