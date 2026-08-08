import { ArrowLeft, Leaf } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/app/login/login-form";
import { Button } from "@/components/ui/button";
import { getDb, isDemoMode } from "@/lib/db";
import { DEMO_ACCOUNTS } from "@/lib/db/seed";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");

  // Only offer the one-click accounts that actually exist in this database.
  const db = getDb();
  const existing = await Promise.all(
    DEMO_ACCOUNTS.map(async (account) => ({
      account,
      exists: Boolean(await db.getUserByEmail(account.email)),
    })),
  );
  const accounts = existing.filter((e) => e.exists).map((e) => e.account);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hero-glow relative hidden border-r border-border lg:block">
        <div className="surface-grain absolute inset-0 opacity-70" aria-hidden />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="size-4" aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight">
              FoodBridge<span className="text-primary"> AI</span>
            </span>
          </Link>

          <div className="max-w-md">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight">
              Every hour a tray of cooked food sits unclaimed, it gets closer to
              being waste.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Sign in as a donor to post surplus and watch the AI score it, or as a
              recipient to see what you can actually collect in time.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            {isDemoMode()
              ? "Demo mode · seeded in-memory data, resets on restart"
              : "Connected to Supabase"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
            <Link href="/">
              <ArrowLeft className="size-4" aria-hidden />
              Back
            </Link>
          </Button>

          <h1 className="text-2xl font-semibold tracking-tight">
            Sign in to FoodBridge
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the email your organisation is registered with, or pick one of the
            demo organisations below.
          </p>

          <LoginForm accounts={accounts} className="mt-7" />
        </div>
      </div>
    </div>
  );
}
