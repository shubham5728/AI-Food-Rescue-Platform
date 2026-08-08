"use client";

import { Building2, Loader2, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
      {error ? (
        <p role="alert" className="text-sm text-destructive text-center">
          {error}
        </p>
      ) : null}

      {accounts.length > 0 ? (
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
      ) : (
        <p className="text-sm text-muted-foreground text-center">No demo accounts available.</p>
      )}
    </div>
  );
}
