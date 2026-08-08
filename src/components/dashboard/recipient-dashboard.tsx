import {
  Check,
  Clock,
  Inbox,
  MapPin,
  Sparkles,
  Truck,
  Utensils,
} from "lucide-react";
import Link from "next/link";

import { AcceptDonationButton } from "@/components/actions/donation-actions";
import { DonationCard } from "@/components/donation-card";
import { ScoreRing } from "@/components/score-ring";
import { MatchBadge, RiskBadge } from "@/components/signal-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DIETARY_LABELS, FOOD_CATEGORY_LABELS } from "@/lib/constants";
import { formatDistance } from "@/lib/geo";
import { getRecipientCommitments, getRecipientOffers } from "@/lib/service";
import { matchTone } from "@/lib/signals";
import type { Organisation } from "@/lib/types";
import { cn, formatDateTime, formatDuration, formatNumber } from "@/lib/utils";

export async function RecipientDashboard({
  organisation,
}: {
  organisation: Organisation;
}) {
  const [offers, commitments] = await Promise.all([
    getRecipientOffers(organisation),
    getRecipientCommitments(organisation),
  ]);

  const openCommitments = commitments.filter(
    (c) => c.donation.status !== "delivered" && c.donation.status !== "cancelled",
  );

  return (
    <div className="container space-y-8 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {organisation.name}
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            {offers.length > 0
              ? `${offers.length} available donation${offers.length === 1 ? "" : "s"} you can actually collect in time.`
              : "Nothing available matches your constraints right now."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            <Utensils className="size-3.5" aria-hidden />
            Capacity {organisation.capacity_min}–{organisation.capacity_max} meals
          </Badge>
          <Badge variant="outline">
            <MapPin className="size-3.5" aria-hidden />
            {organisation.pickup_radius_km} km range
          </Badge>
          <Badge variant="outline">
            <Clock className="size-3.5" aria-hidden />
            {organisation.pickup_lead_time_min} min notice
          </Badge>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="offers-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" aria-hidden />
          <h2 id="offers-heading" className="text-lg font-semibold tracking-tight">
            Recommended for you
          </h2>
        </div>
        <p className="-mt-2 text-sm text-muted-foreground">
          Only food that clears every one of your constraints — diet, capacity,
          allergens, distance and whether you can reach it before the deadline.
        </p>

        {offers.length > 0 ? (
          <ul className="grid gap-4 lg:grid-cols-2">
            {offers.map(({ donation, donor, match, risk }, index) => {
              const tone = matchTone(match.score);
              return (
                <li key={donation.id}>
                  <Card
                    className={cn(
                      "h-full transition-shadow hover:shadow-lift",
                      index === 0 && "border-primary/35 ring-1 ring-primary/20",
                    )}
                  >
                    <CardContent className="flex h-full flex-col pt-5">
                      <div className="flex items-start gap-4">
                        <ScoreRing
                          score={match.score}
                          ringClassName={tone.ring}
                          size={72}
                          label={`${donation.food_name} match score`}
                          sublabel="match"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-semibold leading-tight tracking-tight">
                            <Link
                              href={`/donations/${donation.id}`}
                              className="hover:underline"
                            >
                              {donation.food_name}
                            </Link>
                          </h3>
                          <p className="mt-0.5 truncate text-sm text-muted-foreground">
                            {donor?.name} · {FOOD_CATEGORY_LABELS[donation.food_type]}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <MatchBadge score={match.score} />
                            <RiskBadge level={risk.level} />
                          </div>
                        </div>
                      </div>

                      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                        <div>
                          <dt className="text-xs text-muted-foreground">Quantity</dt>
                          <dd className="tabular font-medium">
                            {formatNumber(donation.meals)} meals
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Diet</dt>
                          <dd className="font-medium">
                            {DIETARY_LABELS[donation.dietary_type]}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Distance</dt>
                          <dd className="font-medium">
                            {formatDistance(match.distance_km)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Collect by</dt>
                          <dd className="font-medium">
                            {formatDateTime(donation.pickup_deadline)}
                          </dd>
                        </div>
                      </dl>

                      {donation.allergens.length > 0 ? (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Contains: {donation.allergens.join(", ")}
                        </p>
                      ) : null}

                      <p className="mt-3 flex items-start gap-2 rounded-lg bg-primary-soft/60 p-3 text-sm text-foreground/90">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                        <span>
                          You can collect this with{" "}
                          {formatDuration(match.time_buffer_min)} to spare.
                        </span>
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 pt-1">
                        <AcceptDonationButton donationId={donation.id} />
                        <Button asChild variant="outline">
                          <Link href={`/donations/${donation.id}`}>View details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon={Inbox}
            title="No matching donations right now"
            description="Available food is filtered against your capacity, diet, allergens, distance and pickup lead time. Anything you can genuinely collect will appear here."
          />
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="commitments-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <Truck className="size-4 text-signal-info" aria-hidden />
          <h2
            id="commitments-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Your pickups
          </h2>
        </div>

        {openCommitments.length > 0 ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {openCommitments.map((item) => (
              <li key={item.donation.id}>
                <DonationCard item={item} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Truck}
            title="No pickups scheduled"
            description="Donations you accept appear here so you can move them through collection and delivery."
          />
        )}
      </section>
    </div>
  );
}
