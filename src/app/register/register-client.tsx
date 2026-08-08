"use client";

import { ArrowLeft, Leaf } from "lucide-react";
import Link from "next/link";
import { RegisterForm } from "@/app/register/register-form";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";

export function RegisterClient() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="size-4" aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight">
              {t("brandName")}
            </span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">
              <ArrowLeft className="size-4" aria-hidden />
              {t("loginTitle")}
            </Link>
          </Button>
        </div>
      </header>

      <div className="container max-w-3xl py-10">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("registerTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {t("registerSub")}
        </p>

        <RegisterForm className="mt-8" />
      </div>
    </div>
  );
}
