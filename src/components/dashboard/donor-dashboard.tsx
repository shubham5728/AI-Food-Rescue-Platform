import {
  Flame,
  ListOrdered,
  PackageSearch,
  Plus,
  Utensils,
  Users,
} from "lucide-react";
import Link from "next/link";

import { DonationCard } from "@/components/donation-card";
import { PriorityQueue } from "@/components/dashboard/priority-queue";
import { StatTile } from "@/components/stat-tile";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getDb } from "@/lib/db";
import {
  getImpactStats,
  scoreDonations,
  type ScoredDonation,
} from "@/lib/service";
import type { Organisation } from "@/lib/types";

export async function DonorDashboard({
  organisation,
}: {
  organisation: Organisation;
}) {
  const db = getDb();

  const [stats, mine, everythingActive] = await Promise.all([
    getImpactStats(),
    db.listDonations({ donor_id: organisation.id }),
    db.listDonations({ activeOnly: true }),
  ]);

  const [scoredMine, scoredActive] = await Promise.all([
    scoreDonations(mine),
    scoreDonations(everythingActive),
  ]);

  // The priority queue is the donor's own work list, not the whole platform's.
  const myActive = scoredActive.filter(
    (s) => s.donation.donor_id === organisation.id,
  );
  const queue = [...myActive].sort(
    (a, b) => b.priority.score - a.priority.score,
  );

  const recent: ScoredDonation[] = scoredMine.slice(0, 6);

  return (
    <div className="container space-y-8 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {organisation.name}
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            {myActive.length > 0
              ? `${myActive.length} of your donations are still in play.`
              : "Nothing of yours is currently open. Post surplus food to get it matched."}
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/donations/new">
            <Plus className="size-4" aria-hidden />
            Add surplus food
          </Link>
        </Button>
      </header>

      <section aria-label="Impact">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Meals donated"
            value={stats.meals_donated}
            icon={Utensils}
            accent="var(--chart-meals)"
            hint="Across every delivered donation"
            emphasis
          />
          <StatTile
            label="Food saved"
            value={stats.food_saved_kg}
            unit="kg"
            icon={PackageSearch}
            accent="var(--chart-kg)"
            hint={`${stats.donations_completed} donations completed`}
          />
          <StatTile
            label="People served"
            value={stats.people_served}
            icon={Users}
            accent="var(--chart-completed)"
            hint="Estimated at two meals per person"
          />
          <StatTile
            label="Meals at risk"
            value={stats.meals_at_risk}
            icon={Flame}
            accent="var(--chart-risk)"
            hint={`${stats.high_risk_donations} high-risk donations open now`}
          />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section aria-labelledby="priority-heading" className="space-y-4">
          <div className="flex items-center gap-2">
            <ListOrdered className="size-4 text-signal-high" aria-hidden />
            <h2 id="priority-heading" className="text-lg font-semibold tracking-tight">
              AI pickup priority
            </h2>
          </div>
          <p className="-mt-2 text-sm text-muted-foreground">
            Ranked by how likely the food is to be lost and how little time is left
            to act.
          </p>

          {queue.length > 0 ? (
            <PriorityQueue items={queue} />
          ) : (
            <EmptyState
              icon={ListOrdered}
              title="Nothing needs attention"
              description="When you post surplus food it appears here, ordered by how urgently it needs a pickup."
              action={
                <Button asChild>
                  <Link href="/donations/new">
                    <Plus className="size-4" aria-hidden />
                    Add surplus food
                  </Link>
                </Button>
              }
            />
          )}
        </section>

        <section aria-labelledby="recent-heading" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="recent-heading" className="text-lg font-semibold tracking-tight">
              Your recent donations
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/donations">View all</Link>
            </Button>
          </div>

          {recent.length > 0 ? (
            <ul className="space-y-3">
              {recent.map((item) => (
                <li key={item.donation.id}>
                  <DonationCard item={item} showDonor={false} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="No donations yet"
              description="Your first donation will be scored for waste risk and matched with verified recipients the moment you submit it."
            />
          )}
        </section>
      </div>
    </div>
  );
}
