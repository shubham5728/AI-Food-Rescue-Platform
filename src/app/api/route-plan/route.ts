import { NextResponse } from "next/server";

import { apiError } from "@/lib/api";
import { getCollectionRoute, getDemandHotspots, ServiceError } from "@/lib/service";
import { requireSession } from "@/lib/session";

/**
 * AI feature #8 — the optimised collection run for the signed-in recipient,
 * plus the demand hotspots that show where capacity is going unused.
 */
export async function GET() {
  try {
    const { organisation } = await requireSession();

    if (organisation.role !== "recipient") {
      throw new ServiceError(
        "Only recipient organisations have a collection route",
        403,
      );
    }

    const [route, hotspots] = await Promise.all([
      getCollectionRoute(organisation),
      getDemandHotspots(),
    ]);

    return NextResponse.json({ ...route, hotspots });
  } catch (error) {
    return apiError(error);
  }
}
