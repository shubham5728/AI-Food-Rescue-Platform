import { MemoryRepository } from "./memory";
import type { Repository } from "./repository";
import { isSupabaseConfigured, SupabaseRepository } from "./supabase";

/**
 * Picks a backend once per process. Supabase when credentials exist, the
 * seeded in-memory store otherwise, so `git clone && npm run dev` produces a
 * working, populated application.
 */

let instance: Repository | null = null;

export function getDb(): Repository {
  if (instance) return instance;

  if (isSupabaseConfigured()) {
    try {
      instance = new SupabaseRepository();
      return instance;
    } catch (error) {
      console.error(
        "[db] Supabase is configured but the client failed to start; falling back to the in-memory demo store.",
        error,
      );
    }
  }

  instance = new MemoryRepository();
  return instance;
}

/** Surfaced in the UI so nobody mistakes demo data for a live database. */
export function isDemoMode(): boolean {
  return getDb().kind === "memory";
}

export type { Repository, DonationFilter } from "./repository";
