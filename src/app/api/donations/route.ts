import { NextResponse } from "next/server";

import { apiError, readJson } from "@/lib/api";
import { createDonation } from "@/lib/service";
import { requireDonor } from "@/lib/session";
import { createDonationSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { organisation } = await requireDonor();
    const input = createDonationSchema.parse(await readJson(request));

    const { donation, analysis } = await createDonation(input, organisation);

    return NextResponse.json(
      {
        donation,
        // Returned so the form can show the risk score without a second round
        // trip — the whole point of the "submit and immediately see it" flow.
        analysis: {
          risk_score: analysis.risk.score,
          risk_level: analysis.risk.level,
          reasons: analysis.donationPatch.waste_risk_reasons,
          priority_score: analysis.priority.score,
          priority_level: analysis.priority.level,
          match_count: analysis.matches.length,
          top_match: analysis.matches[0]
            ? {
                name: analysis.matches[0].recipient.name,
                score: analysis.matchRows[0].match_score,
              }
            : null,
          ai_source: analysis.ai_source,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}
