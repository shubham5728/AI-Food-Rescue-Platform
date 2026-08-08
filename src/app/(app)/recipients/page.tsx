import { Check, Clock, MapPin, ShieldCheck, Users, Utensils } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DIETARY_LABELS,
  FOOD_CATEGORY_LABELS,
  ORGANISATION_TYPE_LABELS,
} from "@/lib/constants";
import { getDb } from "@/lib/db";
import { formatDistance, haversineKm } from "@/lib/geo";
import { requireSession } from "@/lib/session";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Recipient directory" };
export const dynamic = "force-dynamic";

export default async function RecipientsPage() {
  const { organisation } = await requireSession();
  const recipients = await getDb().listOrganisations("recipient");

  // Distances are measured from the viewing organisation, which is what a
  // donor actually wants to know when scanning the directory.
  const withDistance = recipients
    .map((recipient) => ({
      recipient,
      distance_km: haversineKm(
        organisation.latitude,
        organisation.longitude,
        recipient.latitude,
        recipient.longitude,
      ),
    }))
    .sort((a, b) => a.distance_km - b.distance_km);

  return (
    <div className="container space-y-6 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Recipient directory
        </h1>
        <p className="mt-1.5 max-w-2xl text-muted-foreground">
          Every organisation FoodBridge can route food to, with the constraints the
          matching engine actually uses. Unverified organisations are listed but
          never recommended.
        </p>
      </header>

      {withDistance.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {withDistance.map(({ recipient, distance_km }) => (
            <li key={recipient.id}>
              <Card className="h-full transition-shadow hover:shadow-lift">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold leading-tight tracking-tight">
                        {recipient.name}
                      </h2>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {ORGANISATION_TYPE_LABELS[recipient.type]}
                      </p>
                    </div>
                    {recipient.verified ? (
                      <Badge variant="success">
                        <ShieldCheck className="size-3" aria-hidden />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Unverified</Badge>
                    )}
                  </div>

                  <dl className="mt-4 space-y-2.5 text-sm">
                    <Row icon={MapPin} label="Distance">
                      {formatDistance(distance_km)} · {recipient.pickup_radius_km} km
                      range
                    </Row>
                    <Row icon={Users} label="Capacity">
                      {formatNumber(recipient.capacity_min ?? 0)}–
                      {formatNumber(recipient.capacity_max ?? 0)} meals, typically{" "}
                      {formatNumber(recipient.typical_quantity ?? 0)}
                    </Row>
                    <Row icon={Utensils} label="Diet">
                      {recipient.dietary_requirements
                        .map((d) => DIETARY_LABELS[d])
                        .join(", ") || "Not stated"}
                    </Row>
                    <Row icon={Clock} label="Pickup">
                      {recipient.can_pickup
                        ? `Self-collects, ${recipient.pickup_lead_time_min} min notice`
                        : "Requires delivery"}
                    </Row>
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

                  {recipient.excluded_allergens.length > 0 ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Cannot handle: {recipient.excluded_allergens.join(", ")}
                    </p>
                  ) : null}

                  <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="size-3.5" aria-hidden />
                    {Math.round(recipient.reliability * 100)}% pickup completion
                    record
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Users}
          title="No recipient organisations yet"
          description="Recipient profiles appear here once they register and specify their capacity, diet and pickup range."
        />
      )}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <dt className="sr-only">{label}</dt>
      <dd className="min-w-0 text-foreground/90">{children}</dd>
    </div>
  );
}
