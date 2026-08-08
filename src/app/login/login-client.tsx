"use client";

import { ArrowLeft, Leaf } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/app/login/login-form";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import { useLanguage } from "@/lib/i18n/context";
import type { DEMO_ACCOUNTS } from "@/lib/db/seed";

type DemoAccount = (typeof DEMO_ACCOUNTS)[number];

export function LoginClient({
  accounts,
  isDemoMode,
}: {
  accounts: DemoAccount[];
  isDemoMode: boolean;
}) {
  const { t } = useLanguage();

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
              {t("brandName")}
            </span>
          </Link>

          <div className="max-w-md">
            <h2 className="text-3xl font-bold leading-tight tracking-tight">
              {t("loginHeroTitle")}
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {t("loginHeroSub")}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            {isDemoMode ? t("demoModeActive") : t("dbModeActive")}
          </p>
        </div>
      </div>

      <div className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="absolute top-6 right-6">
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-md">
          <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
            <Link href="/">
              <ArrowLeft className="size-4" aria-hidden />
              Back
            </Link>
          </Button>

          <h1 className="text-2xl font-bold tracking-tight">
            {t("loginPageTitle")}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t("loginPageSub")}
          </p>

          <LoginForm accounts={accounts} className="mt-6" />
        </div>
      </div>
    </div>
  );
}
