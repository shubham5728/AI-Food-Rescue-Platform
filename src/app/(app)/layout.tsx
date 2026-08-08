import { Leaf } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountMenu } from "@/components/shell/account-menu";
import { MainNav } from "@/components/shell/main-nav";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import { getDb, isDemoMode } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  // The switcher is a demo affordance: it lets one person walk both sides of
  // the handover without signing out between steps.
  const organisations = await getDb().listOrganisations();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="size-4" aria-hidden />
            </span>
            <span className="hidden text-base font-semibold tracking-tight sm:block">
              FoodBridge<span className="text-primary"> AI</span>
            </span>
          </Link>

          <MainNav role={session.organisation.role} className="ml-2 flex-1" />

          <LanguageSwitcher />

          <AccountMenu
            organisation={session.organisation}
            organisations={organisations}
            demoMode={isDemoMode()}
          />
        </div>
      </header>

      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}

