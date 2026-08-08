import { NextResponse } from "next/server";

import { apiError } from "@/lib/api";
import { getAllocationPlan } from "@/lib/service";
import { requireSession } from "@/lib/session";

/** AI feature #6 — how a donation splits across recipients. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireSession();
    const plan = await getAllocationPlan(id);
    return NextResponse.json({ plan });
  } catch (error) {
    return apiError(error);
  }
}
