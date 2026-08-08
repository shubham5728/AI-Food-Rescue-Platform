import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ServiceError } from "@/lib/service";
import { AuthError } from "@/lib/session";
import { fieldErrors } from "@/lib/validation";

/**
 * One error shape for every route: `{ error, fields? }`. The client wrapper in
 * lib/client-api.ts reads exactly this, so a validation failure surfaces on the
 * offending form field instead of as a generic toast.
 */
export function apiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Please correct the highlighted fields.", fields: fieldErrors(error) },
      { status: 422 },
    );
  }

  if (error instanceof AuthError || error instanceof ServiceError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("[api] unhandled error", error);
  return NextResponse.json(
    { error: "Something went wrong on our side. Please try again." },
    { status: 500 },
  );
}

/** Tolerates an empty body, which several of these endpoints allow. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    const text = await request.text();
    return text ? JSON.parse(text) : {};
  } catch {
    throw new ServiceError("Request body must be valid JSON", 400);
  }
}
