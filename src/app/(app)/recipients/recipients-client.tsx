"use client";

import { Check, Clock, MapPin, ShieldCheck, Users, Utensils } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DIETARY_LABELS,
  FOOD_CATEGORY_LABELS,
  ORGANISATION_TYPE_LABELS,
} from "@/lib/constants";
import { formatDistance } from "@/lib/geo";
import { useLanguage } from "@/lib/i18n/context";
import type { Organisation } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface RecipientWithDistance {
  recipient: Organisation;
  distance_km: number;
}

import { DynamicFoodMap, type MapMarkerItem } from "@/components/map";

export function RecipientsClient({ items }: { items: RecipientWithDistance[] }) {
  const { t } = useLanguage();

  const recipientMarkers: MapMarkerItem[] = items.map(({ recipient, distance_km }) => ({
    id: recipient.id,
    lat: recipient.latitude,
    lng: recipient.longitude,
    title: recipient.name,
    type: "recipient",
    subtitle: `${ORGANISATION_TYPE_LABELS[recipient.type]} · ${formatDistance(distance_km)} away`,
    address: recipient.address,
  }));

  return (
    <div className="container space-y-6 py-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("recipientsTitle")}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {t("recipientsSub")}
        </p>
      </header>

      {/* Interactive Ahmedabad NGO Map */}
      <section aria-label="NGO Locations Map">
        <DynamicFoodMap
          markers={recipientMarkers}
          center={[23.0350, 72.5450]}
          zoom={12}
          height="380px"
        />
      </section>

      {items.length > 0 ? (

        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map(({ recipient, distance_km }) => (
            <li key={recipient.id}>
              <Card className="h-full transition-shadow hover:shadow-lift">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold leading-tight tracking-tight">
                        {recipient.name}
                      </h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {ORGANISATION_TYPE_LABELS[recipient.type]}
                      </p>
                    </div>
                    {recipient.verified ? (
                      <Badge variant="success">
                        <ShieldCheck className="size-3" aria-hidden />
                        {t("verifiedBadge")}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Unverified</Badge>
                    )}
                  </div>

                  <dl className="mt-4 space-y-2.5 text-xs sm:text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      <dd className="min-w-0 text-foreground/90">
                        {formatDistance(distance_km)} · {recipient.pickup_radius_km} km
                      </dd>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      <dd className="min-w-0 text-foreground/90">
                        {t("capacity")}: {formatNumber(recipient.capacity_min ?? 0)}–{formatNumber(recipient.capacity_max ?? 0)}
                      </dd>
                    </div>
                    <div className="flex items-start gap-2">
                      <Utensils className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      <dd className="min-w-0 text-foreground/90">
                        {recipient.dietary_requirements
                          .map((d) => DIETARY_LABELS[d])
                          .join(", ") || "Standard"}
                      </dd>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      <dd className="min-w-0 text-foreground/90">
                        {recipient.can_pickup
                          ? `${recipient.pickup_lead_time_min} min notice`
                          : "Requires delivery"}
                      </dd>
                    </div>
                  </dl>

                  {recipient.accepted_food_types.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {recipient.accepted_food_types.map((type) => (
                        <Badge key={type} variant="outline">
                          {FOOD_CATEGORY_LABELS[type]}
                        </Badge>
                      ))}
                    </div>
                  ) : null}

                  <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="size-3.5 text-primary" aria-hidden />
                    {Math.round(recipient.reliability * 100)}% pickup rate
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Users}
          title={t("recipientsTitle")}
          description={t("recipientsSub")}
        />
      )}
    </div>
  );
}
