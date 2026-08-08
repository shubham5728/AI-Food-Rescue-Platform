import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { getDb } from "@/lib/db";
import type { Organisation, User } from "@/lib/types";

/**
 * Session handling.
 *
 * The MVP identifies an organisation by a signed cookie carrying its user id
 * rather than running a password flow. That is a deliberate scope decision:
 * the demo needs to switch between a donor and a recipient in one click, and
 * every authorisation check in the app reads from this module — so swapping
 * the lookup for a Supabase Auth session touches this file and nothing else.
 */

const COOKIE_NAME = "foodbridge_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function secret(): string {
  return process.env.SESSION_SECRET || "foodbridge-development-secret";
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function serialiseSession(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

/** Returns the user id only if the signature is intact. */
function parseSession(raw: string | undefined): string | null {
  if (!raw) return null;
  const index = raw.lastIndexOf(".");
  if (index <= 0) return null;

  const userId = raw.slice(0, index);
  const provided = Buffer.from(raw.slice(index + 1));
  const expected = Buffer.from(sign(userId));

  if (provided.length !== expected.length) return null;
  return timingSafeEqual(provided, expected) ? userId : null;
}

export const sessionCookieOptions = {
  name: COOKIE_NAME,
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
  secure: process.env.NODE_ENV === "production",
};

export interface Session {
  user: User;
  organisation: Organisation;
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const userId = parseSession(store.get(COOKIE_NAME)?.value);
  if (!userId) return null;

  const db = getDb();
  const user = await db.getUserById(userId);
  if (!user) return null;

  const organisation = await db.getOrganisationByUserId(user.id);
  if (!organisation) return null;

  return { user, organisation };
}

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status = 401,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new AuthError("You need to sign in to do that");
  return session;
}

export async function requireDonor(): Promise<Session> {
  const session = await requireSession();
  if (session.organisation.role !== "donor") {
    throw new AuthError("Only donor organisations can do that", 403);
  }
  return session;
}

export async function requireRecipient(): Promise<Session> {
  const session = await requireSession();
  if (session.organisation.role !== "recipient") {
    throw new AuthError("Only recipient organisations can do that", 403);
  }
  return session;
}
