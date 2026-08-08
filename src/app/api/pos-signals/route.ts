import { NextResponse } from "next/server";

import { apiError } from "@/lib/api";
import { getDb } from "@/lib/db";
import { fetchPosSignals, getPosProvider, posAlerts } from "@/lib/integrations/pos";
import { requireSession } from "@/lib/session";

/**
 * AI feature #7 — delivery-platform surplus signals.
 *
 * `mode` is returned on every response and is currently always "simulated":
 * no partner API exists for Zomato or Swiggy order data. The UI must show that
 * label — see the header comment in lib/integrations/pos.ts.
 */
export async function GET() {
  try {
    await requireSession();

    const donors = await getDb().listOrganisations("donor");
    const signals = await fetchPosSignals(donors);

    return NextResponse.json({
      mode: getPosProvider().mode,
      signals,
      alerts: posAlerts(signals),
    });
  } catch (error) {
    return apiError(error);
  }
}
