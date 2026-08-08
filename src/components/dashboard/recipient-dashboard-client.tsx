"use client";

import {
  Check,
  Clock,
  Inbox,
  MapPin,
  Radio,
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
import { useLanguage } from "@/lib/i18n/context";
import type { RecipientOffer, ScoredDonation } from "@/lib/service";
import { matchTone } from "@/lib/signals";
import type { Organisation } from "@/lib/types";
import { cn, formatDateTime, formatDuration, formatNumber } from "@/lib/utils";

interface RecipientDashboardClientProps {
  organisation: Organisation;
  offers: RecipientOffer[];
  openCommitments: ScoredDonation[];
}

import { DynamicFoodMap, type MapMarkerItem } from "@/components/map";

export function RecipientDashboardClient({
  organisation,
  offers,
  openCommitments,
}: RecipientDashboardClientProps) {
  const { t } = useLanguage();

  const recipientMapMarkers: MapMarkerItem[] = [
    {
      id: organisation.id,
      lat: organisation.latitude,
      lng: organisation.longitude,
      title: organisation.name,
      type: "recipient",
      subtitle: t("ngoSubtitle"),
      address: organisation.address,
    },
    ...offers.map(({ donation }) => ({
      id: donation.id,
      lat: donation.latitude,
      lng: donation.longitude,
      title: donation.food_name,
      type: "donation" as const,
      meals: donation.meals,
      address: donation.address,
    })),
  ];

  return (
    <div className="container space-y-8 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            {organisation.name}
          </h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            {offers.length > 0
              ? `${offers.length} ${t("activeOffersMsg")}`
              : t("recipientsSub")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-primary/30 text-primary font-semibold">
            <Utensils className="size-3.5 mr-1" aria-hidden />
            {t("capacity")}: {organisation.capacity_min}–{organisation.capacity_max} meals
          </Badge>
          <Badge variant="outline" className="border-primary/30 text-primary font-semibold">
            <MapPin className="size-3.5 mr-1" aria-hidden />
            {organisation.pickup_radius_km} {t("radiusSuffix")}
          </Badge>
          <Badge variant="outline" className="border-primary/30 text-primary font-semibold">
            <Clock className="size-3.5 mr-1" aria-hidden />
            {organisation.pickup_lead_time_min} {t("leadTimeSuffix")}
          </Badge>
        </div>
      </header>

      {/* Live GPS Delivery Tracking Banner Card */}
      <Card className="border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold shadow">
              <Truck className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-extrabold text-base text-foreground">{t("incomingDeliveryTransit")}</span>
                <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                  <Radio className="size-3 mr-1 animate-pulse" /> {t("liveTrackingActive")}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("driverStatusRecipient")}
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow">
            <Link href="/tracking/del_demo01">
              {t("trackIncomingLive")}
            </Link>
          </Button>
        </div>
      </Card>

      {/* Satellite Dispatch Map for Recipient */}
      <section aria-label="Satellite Dispatch Map" className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="size-5 text-primary" aria-hidden />
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {t("liveDispatchMapTitle")}
          </h2>
        </div>
        <DynamicFoodMap
          markers={recipientMapMarkers}
          center={[organisation.latitude, organisation.longitude]}
          zoom={13}
          height="380px"
        />
      </section>

      {/* Offers */}

      <section aria-labelledby="offers-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" aria-hidden />
          <h2 id="offers-heading" className="text-lg font-semibold tracking-tight">
            {t("matchBest")}
          </h2>
        </div>

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
                          label={`${donation.food_name}`}
                          sublabel={t("matchScore")}
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
                            {donor?.name} · {FOOD_CATEGORY_LABELS[donation.food_type as keyof typeof FOOD_CATEGORY_LABELS]}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <MatchBadge score={match.score} />
                            <RiskBadge level={risk.level} />
                          </div>
                        </div>
                      </div>

                      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                        <div>
                          <dt className="text-xs text-muted-foreground">{t("quantity")}</dt>
                          <dd className="tabular font-medium">
                            {formatNumber(donation.meals)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">{t("dietPreference")}</dt>
                          <dd className="font-medium">
                            {DIETARY_LABELS[donation.dietary_type as keyof typeof DIETARY_LABELS]}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">{t("location")}</dt>
                          <dd className="font-medium">
                            {formatDistance(match.distance_km)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">{t("expiry")}</dt>
                          <dd className="font-medium">
                            {formatDateTime(donation.pickup_deadline)}
                          </dd>
                        </div>
                      </dl>

                      <p className="mt-3 flex items-start gap-2 rounded-lg bg-primary-soft/60 p-2.5 text-xs text-foreground/90">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                        <span>
                          {t("statusPending")} — {formatDuration(match.time_buffer_min)} {t("bufferSuffix")}
                        </span>
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 pt-1">
                        <AcceptDonationButton donationId={donation.id} />
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/donations/${donation.id}`}>{t("actionDetails")}</Link>
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
            title={t("donationsSub")}
            description={t("recipientsSub")}
          />
        )}
      </section>

      {/* Commitments */}
      <section aria-labelledby="commitments-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <Truck className="size-4 text-signal-info" aria-hidden />
          <h2 id="commitments-heading" className="text-lg font-semibold tracking-tight">
            {t("statusClaimed")}
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
            title={t("recipientsTitle")}
            description={t("recipientsSub")}
          />
        )}
      </section>
    </div>
  );
}
