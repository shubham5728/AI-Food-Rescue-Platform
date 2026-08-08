"use client";

import {
  AlertTriangle,
  Clock,
  Flame,
  Info,
  MapPin,
  Navigation,
  Route as RouteIcon,
  Store,
  TrendingDown,
  Users,
  Utensils,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import type { PosSignal } from "@/lib/integrations/pos";
import type { RouteResult } from "@/lib/service";
import type { DemandHotspot, SurplusForecast, UserRole } from "@/lib/types";
import { cn, formatDuration, formatNumber, formatTime } from "@/lib/utils";

interface OperationsClientProps {
  role: UserRole;
  organisationName: string;
  forecasts: SurplusForecast[];
  posMode: "simulated" | "live";
  posSignals: PosSignal[];
  posAlerts: PosSignal[];
  hotspots: DemandHotspot[];
  route: RouteResult | null;
}

const CONFIDENCE_TONE = {
  high: "low",
  medium: "medium",
  low: "secondary",
} as const;

export function OperationsClient({
  role,
  organisationName,
  forecasts,
  posMode,
  posSignals,
  posAlerts,
  hotspots,
  route,
}: OperationsClientProps) {
  const likely = forecasts.filter((f) => f.probability > 0);

  return (
    <div className="container space-y-8 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          AI Operations
        </h1>
        <p className="mt-1.5 max-w-3xl text-muted-foreground">
          Everything here is about food that does not exist yet. Where surplus is
          likely to appear, which kitchens are tracking below their prep, where
          demand is going unmet, and the order to drive today&apos;s pickups.
        </p>
      </header>

      {/* -- F1 Surplus forecast ------------------------------------------- */}
      <section aria-labelledby="forecast-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="size-4 text-signal-info" aria-hidden />
          <h2 id="forecast-heading" className="text-lg font-semibold tracking-tight">
            Surplus forecast · next 24 hours
          </h2>
        </div>
        <p className="-mt-2 max-w-3xl text-sm text-muted-foreground">
          Built from each donor&apos;s own posting history, weighted towards recent
          activity. A donor with two past donations gets a forecast labelled low
          confidence rather than a confident guess.
        </p>

        {likely.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {likely.map((f) => (
              <li key={f.organisation_id}>
                <Card className="h-full">
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold leading-tight">
                          {f.organisation_name}
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {f.sample_size} past donation
                          {f.sample_size === 1 ? "" : "s"} in the window
                        </p>
                      </div>
                      <Badge variant={CONFIDENCE_TONE[f.confidence]}>
                        {f.confidence} confidence
                      </Badge>
                    </div>

                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="tabular text-3xl font-semibold tracking-tight">
                        {f.probability}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        chance of surplus
                      </span>
                    </div>
                    <Progress
                      value={f.probability}
                      className="mt-2 h-1.5"
                      indicatorClassName="bg-signal-info"
                    />

                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Expected quantity
                        </dt>
                        <dd className="tabular font-medium">
                          {f.expected_meals} meals
                          <span className="ml-1 font-normal text-muted-foreground">
                            ({f.meals_low}–{f.meals_high})
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Likely window</dt>
                        <dd className="font-medium">
                          {formatTime(f.window_start)} – {formatTime(f.window_end)}
                        </dd>
                      </div>
                    </dl>

                    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Flame className="size-3.5 text-signal-high" aria-hidden />
                      Projected waste risk if unclaimed:{" "}
                      <span className="tabular font-medium text-foreground">
                        {f.projected_waste_risk}/100
                      </span>
                    </p>

                    <ul className="mt-3 space-y-1">
                      {f.reasons.map((reason) => (
                        <li
                          key={reason}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <span
                            className="mt-1 size-1 shrink-0 rounded-full bg-muted-foreground"
                            aria-hidden
                          />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={TrendingDown}
            title="Not enough history to forecast"
            description="Forecasts appear once donors have posted surplus a few times. The model needs their own pattern, not a generic one."
          />
        )}
      </section>

      {/* -- F7 POS signals ------------------------------------------------ */}
      <section aria-labelledby="pos-heading" className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Store className="size-4 text-accent" aria-hidden />
          <h2 id="pos-heading" className="text-lg font-semibold tracking-tight">
            Delivery platform signals
          </h2>
          {posMode === "simulated" ? (
            <Badge variant="medium">
              <Info className="size-3.5" aria-hidden />
              Simulated data
            </Badge>
          ) : (
            <Badge variant="low">Live</Badge>
          )}
        </div>

        {posMode === "simulated" ? (
          <p className="-mt-2 flex items-start gap-2.5 rounded-lg border border-signal-medium/30 bg-signal-medium/[0.07] p-3.5 text-sm">
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0 text-signal-medium"
              aria-hidden
            />
            <span>
              Zomato and Swiggy do not publish a partner API for order or demand
              data, so these numbers are generated, not real. The connector is
              built against a provider interface — if a partner agreement lands,
              a live implementation drops in and this label changes.
            </span>
          </p>
        ) : null}

        {posAlerts.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {posAlerts.length} kitchen{posAlerts.length === 1 ? "" : "s"}
            </span>{" "}
            tracking far enough below prep to be worth a call now.
          </p>
        ) : null}

        {posSignals.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {posSignals.map((s) => {
              const soldPct = Math.round((s.sold_covers / s.prepped_covers) * 100);
              return (
                <li key={`${s.platform}-${s.organisation_id}`}>
                  <Card className={cn("h-full", s.alert && "border-accent/40")}>
                    <CardContent className="pt-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold leading-tight">
                            {s.organisation_name}
                          </h3>
                          <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                            via {s.platform}
                          </p>
                        </div>
                        {s.alert ? (
                          <Badge variant="accent">Surplus alert</Badge>
                        ) : (
                          <Badge variant="secondary">{s.confidence}% confidence</Badge>
                        )}
                      </div>

                      <p className="mt-3 text-sm text-muted-foreground">{s.trend}</p>

                      <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <dt className="text-xs text-muted-foreground">Prepped</dt>
                          <dd className="tabular font-medium">{s.prepped_covers}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Sold</dt>
                          <dd className="tabular font-medium">{s.sold_covers}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Likely surplus
                          </dt>
                          <dd className="tabular font-semibold text-accent">
                            {s.projected_surplus_meals} meals
                          </dd>
                        </div>
                      </dl>

                      <Progress
                        value={soldPct}
                        className="mt-3 h-1.5"
                        indicatorClassName="bg-accent"
                      />
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {soldPct}% of prepped covers sold so far
                      </p>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon={Store}
            title="No platform-listed donors"
            description="Restaurants and caterers appear here once they are listed on a delivery platform."
          />
        )}
      </section>

      {/* -- F8 Route ------------------------------------------------------ */}
      {role === "recipient" ? (
        <section aria-labelledby="route-heading" className="space-y-4">
          <div className="flex items-center gap-2">
            <RouteIcon className="size-4 text-primary" aria-hidden />
            <h2 id="route-heading" className="text-lg font-semibold tracking-tight">
              Your collection run
            </h2>
          </div>

          {route && route.plan.stops.length > 0 ? (
            <Card>
              <CardHeader className="border-b border-border bg-muted/40">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="size-4" aria-hidden />
                    {route.plan.stops.length} stop
                    {route.plan.stops.length === 1 ? "" : "s"} ·{" "}
                    <span className="tabular">{route.plan.total_km} km</span> ·{" "}
                    <span className="tabular">
                      {formatDuration(route.plan.total_minutes)}
                    </span>
                  </CardTitle>
                  <Badge
                    variant={route.strategy === "shortest" ? "low" : "medium"}
                  >
                    {route.strategy === "shortest"
                      ? "Shortest route"
                      : "Deadline-first"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{route.note}</p>
              </CardHeader>

              <CardContent className="pt-5">
                <ol className="space-y-0">
                  {route.plan.stops.map((stop, index) => {
                    const missed = stop.slack_minutes < 0;
                    const isLast = index === route.plan.stops.length - 1;
                    return (
                      <li key={stop.donation_id} className="relative flex gap-4 pb-5 last:pb-0">
                        {!isLast ? (
                          <span
                            aria-hidden
                            className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 rounded-full bg-border"
                          />
                        ) : null}
                        <span
                          className={cn(
                            "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                            missed
                              ? "border-signal-critical bg-signal-critical text-white"
                              : "border-primary bg-primary text-primary-foreground",
                          )}
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="truncate text-sm font-medium">{stop.label}</p>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="size-3" aria-hidden />
                              ETA {formatDuration(stop.eta_minutes)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="size-3" aria-hidden />
                              {stop.leg_km} km leg
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Utensils className="size-3" aria-hidden />
                              {stop.meals} meals
                            </span>
                            <span
                              className={cn(
                                missed && "font-medium text-signal-critical",
                              )}
                            >
                              {missed
                                ? `Misses deadline by ${formatDuration(-stop.slack_minutes)}`
                                : `${formatDuration(stop.slack_minutes)} spare`}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {route.plan.saved_km > 0 ? (
                  <p className="mt-4 rounded-lg bg-primary-soft/60 p-3 text-sm">
                    Ordering the run this way saves{" "}
                    <span className="tabular font-semibold text-primary">
                      {route.plan.saved_km} km
                    </span>{" "}
                    against collecting in the order the donations were posted.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={RouteIcon}
              title="No pickups to route"
              description={`${organisationName} has no accepted donations awaiting collection. Accept a donation and the optimised run appears here.`}
            />
          )}
        </section>
      ) : null}

      {/* -- F8 Hotspots --------------------------------------------------- */}
      <section aria-labelledby="hotspot-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-signal-high" aria-hidden />
          <h2 id="hotspot-heading" className="text-lg font-semibold tracking-tight">
            Demand hotspots
          </h2>
        </div>
        <p className="-mt-2 max-w-3xl text-sm text-muted-foreground">
          Recipients clustered by proximity, showing capacity that nothing is
          currently heading towards — where an extra donor would do the most good.
        </p>

        {hotspots.length > 0 ? (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {hotspots.map((h) => (
              <li key={`${h.latitude}-${h.longitude}`}>
                <Card className="h-full p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-medium">{h.label}</p>
                    <span className="tabular shrink-0 text-sm font-semibold text-signal-high">
                      {formatNumber(h.unmet_meals)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    meals of unmet capacity · {h.recipients} organisation
                    {h.recipients === 1 ? "" : "s"}
                  </p>
                  <Progress
                    value={h.intensity * 100}
                    className="mt-3 h-1.5"
                    indicatorClassName="bg-signal-high"
                  />
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Users}
            title="No unmet demand"
            description="Every verified recipient currently has food heading its way."
          />
        )}
      </section>
    </div>
  );
}
