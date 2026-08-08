"use client";

import { Building2, Check, ChevronDown, LogOut, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/client-api";
import { ORGANISATION_TYPE_LABELS } from "@/lib/constants";
import type { Organisation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

/**
 * Identity control, plus the demo account switcher.
 *
 * Walking the demo means being the restaurant, then being the kitchen that
 * accepts from it. Switching signs in as the other organisation for real — it
 * is the same login endpoint, not a client-side impersonation flag.
 */
export function AccountMenu({
  organisation,
  organisations,
  demoMode,
}: {
  organisation: Organisation;
  organisations: Organisation[];
  demoMode: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const { t } = useLanguage();

  const switchTo = async (target: Organisation) => {
    if (target.id === organisation.id) return;
    setBusy(true);
    try {
      await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: target.email }),
      });
      toast.success(`${t("signedInAs")}${target.name}`);
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error(t("couldNotSwitch"));
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const donors = organisations.filter((o) => o.role === "donor");
  const recipients = organisations.filter((o) => o.role === "recipient");
  const Icon = organisation.role === "donor" ? Store : Building2;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={busy}
        className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      >
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md",
            organisation.role === "donor"
              ? "bg-accent-soft text-accent"
              : "bg-primary-soft text-primary",
          )}
          aria-hidden
        >
          <Icon className="size-3.5" />
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-[11rem] truncate text-sm font-medium leading-tight">
            {organisation.name}
          </span>
          <span className="block text-[11px] capitalize leading-tight text-muted-foreground">
            {organisation.role}
          </span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <div className="px-2.5 py-2">
          <p className="text-sm font-medium">{organisation.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {ORGANISATION_TYPE_LABELS[organisation.type]} · {organisation.email}
          </p>
          {organisation.verified ? (
            <Badge variant="success" className="mt-2">
              <Check className="size-3" aria-hidden />
              {t("verified")}
            </Badge>
          ) : (
            <Badge variant="medium" className="mt-2">
              {t("pendingVerification")}
            </Badge>
          )}
        </div>

        {demoMode ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t("switchDonors")}</DropdownMenuLabel>
            {donors.map((org) => (
              <AccountRow
                key={org.id}
                org={org}
                current={org.id === organisation.id}
                onSelect={() => void switchTo(org)}
              />
            ))}

            <DropdownMenuLabel className="mt-1">
              {t("switchRecipients")}
            </DropdownMenuLabel>
            {recipients
              .filter((org) => org.verified)
              .map((org) => (
                <AccountRow
                  key={org.id}
                  org={org}
                  current={org.id === organisation.id}
                  onSelect={() => void switchTo(org)}
                />
              ))}
          </>
        ) : null}

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOut className="size-4" aria-hidden />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AccountRow({
  org,
  current,
  onSelect,
}: {
  org: Organisation;
  current: boolean;
  onSelect: () => void;
}) {
  return (
    <DropdownMenuItem onSelect={onSelect} className={cn(current && "bg-muted")}>
      <span className="min-w-0 flex-1 truncate">{org.name}</span>
      {current ? (
        <Check className="size-4 shrink-0 text-primary" aria-hidden />
      ) : null}
    </DropdownMenuItem>
  );
}
