import { NextResponse } from "next/server";

import { apiError } from "@/lib/api";
import { reanalyseDonation } from "@/lib/service";
import { requireSession } from "@/lib/session";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireSession();
    const donation = await reanalyseDonation(id);
    return NextResponse.json({ donation });
  } catch (error) {
    return apiError(error);
  }
}
