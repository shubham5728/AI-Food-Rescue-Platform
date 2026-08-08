import type { Metadata } from "next";

import { OperationsClient } from "@/app/(app)/operations/operations-client";
import { getDb } from "@/lib/db";
import { fetchPosSignals, getPosProvider, posAlerts } from "@/lib/integrations/pos";
import {
  getCollectionRoute,
  getDemandHotspots,
  getSurplusForecasts,
  type RouteResult,
} from "@/lib/service";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "AI Operations" };
export const dynamic = "force-dynamic";

/**
 * The forward-looking half of the product.
 *
 * Every other screen reacts to food that already exists. This one is about
 * what has not happened yet: where surplus is about to appear, which kitchens
 * are running below their prep, where demand is going unmet, and the order to
 * drive the pickups already on the books.
 */
export default async function OperationsPage() {
  const { organisation } = await requireSession();

  const donors = await getDb().listOrganisations("donor");

  const [forecasts, signals, hotspots, route] = await Promise.all([
    getSurplusForecasts(24),
    fetchPosSignals(donors),
    getDemandHotspots(),
    organisation.role === "recipient"
      ? getCollectionRoute(organisation)
      : Promise.resolve(null as RouteResult | null),
  ]);

  return (
    <OperationsClient
      role={organisation.role}
      organisationName={organisation.name}
      forecasts={forecasts}
      posMode={getPosProvider().mode}
      posSignals={signals}
      posAlerts={posAlerts(signals)}
      hotspots={hotspots}
      route={route}
    />
  );
}
