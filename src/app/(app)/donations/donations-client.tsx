"use client";

import { PackageSearch, Plus } from "lucide-react";
import Link from "next/link";

import { DonationCard } from "@/components/donation-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useLanguage } from "@/lib/i18n/context";
import type { ScoredDonation } from "@/lib/service";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

type Scope = "mine" | "open" | "all";

interface DonationsClientProps {
  scored: ScoredDonation[];
  role: UserRole;
  scope: Scope;
}

export function DonationsClient({ scored, role, scope }: DonationsClientProps) {
  const { t } = useLanguage();

  const SCOPES: { key: Scope; label: string }[] = [
    { key: "mine", label: t("tabDonations") },
    { key: "open", label: t("statusPending") },
    { key: "all", label: t("filterAll") },
  ];

  return (
    <div className="container space-y-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("donationsTitle")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {scored.length} {t("donationsSub")}
          </p>
        </div>

        {role === "donor" ? (
          <Button asChild>
            <Link href="/donations/new">
              <Plus className="size-4" aria-hidden />
              {t("btnNewDonation")}
            </Link>
          </Button>
        ) : null}
      </header>

      <nav aria-label="Filter donations" className="flex flex-wrap gap-1.5">
        {SCOPES.map((item) => (
          <Link
            key={item.key}
            href={`/donations?scope=${item.key}`}
            aria-current={item.key === scope ? "page" : undefined}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-tight transition-colors",
              item.key === scope
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {scored.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scored.map((item) => (
            <li key={item.donation.id}>
              <DonationCard item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={PackageSearch}
          title={t("donationsSub")}
          description={t("ctaSub")}
          action={
            role === "donor" ? (
              <Button asChild>
                <Link href="/donations/new">
                  <Plus className="size-4" aria-hidden />
                  {t("btnNewDonation")}
                </Link>
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
