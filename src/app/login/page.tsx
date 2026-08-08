import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getDb, isDemoMode } from "@/lib/db";
import { DEMO_ACCOUNTS } from "@/lib/db/seed";
import { getSession } from "@/lib/session";
import { LoginClient } from "./login-client";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");

  // Offer the demo accounts available
  const db = getDb();
  const existing = await Promise.all(
    DEMO_ACCOUNTS.map(async (account) => ({
      account,
      exists: Boolean(await db.getUserByEmail(account.email)),
    })),
  );
  const accounts = existing.filter((e) => e.exists).map((e) => e.account);

  return <LoginClient accounts={accounts} isDemoMode={isDemoMode()} />;
}
