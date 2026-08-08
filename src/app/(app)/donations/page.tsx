import { PackageSearch, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { DonationCard } from "@/components/donation-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getDb } from "@/lib/db";
import { scoreDonations } from "@/lib/service";
import { requireSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Donations" };
export const dynamic = "force-dynamic";

type Scope = "mine" | "open" | "all";

const SCOPES: { key: Scope; label: string }[] = [
  { key: "mine", label: "Mine" },
  { key: "open", label: "Open" },
  { key: "all", label: "All" },
];

export default async function DonationsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const { organisation } = await requireSession();
  const { scope: rawScope } = await searchParams;

  const scope: Scope = SCOPES.some((s) => s.key === rawScope)
    ? (rawScope as Scope)
    : "mine";

  const db = getDb();

  // "Mine" means something different on each side of the handover.
  const donations =
    scope === "open"
      ? await db.listDonations({ status: ["available"] })
      : scope === "all"
        ? await db.listDonations()
        : organisation.role === "donor"
          ? await db.listDonations({ donor_id: organisation.id })
          : await db.listDonations({ matched_recipient_id: organisation.id });

  const scored = await scoreDonations(donations);

  return (
    <div className="container space-y-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Donations
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            {scored.length} donation{scored.length === 1 ? "" : "s"} · risk and
            priority recomputed against the current time
          </p>
        </div>

        {organisation.role === "donor" ? (
          <Button asChild>
            <Link href="/donations/new">
              <Plus className="size-4" aria-hidden />
              Add surplus food
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
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              item.key === scope
                ? "border-transparent bg-foreground text-background"
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
          title="Nothing here yet"
          description={
            scope === "mine" && organisation.role === "donor"
              ? "Post surplus food and it will be scored and matched immediately."
              : "No donations match this filter right now."
          }
          action={
            organisation.role === "donor" ? (
              <Button asChild>
                <Link href="/donations/new">
                  <Plus className="size-4" aria-hidden />
                  Add surplus food
                </Link>
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
