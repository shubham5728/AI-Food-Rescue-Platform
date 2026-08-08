import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/index";

export async function GET() {
  try {
    const db = getDb();
    const data = await db.listOrganisations();
    return NextResponse.json({ success: true, count: data.length });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      name: error.name
    }, { status: 500 });
  }
}
