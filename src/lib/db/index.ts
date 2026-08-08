import { MemoryRepository } from "./memory";
import type { Repository } from "./repository";
import { PrismaRepository } from "./prisma";

let instance: Repository | null = null;

/**
 * Picks a backend once per process. Uses SQLite/Prisma for persistence,
 * falling back to the in-memory store if initialization fails.
 */
export function getDb(): Repository {
  if (instance) return instance;

  try {
    instance = new PrismaRepository();
    console.log("[db] Using SQLite (Prisma) backend.");
  } catch (error) {
    console.error(
      "[db] Prisma failed to start; falling back to the in-memory demo store.",
      error
    );
    instance = new MemoryRepository();
  }

  return instance;
}

export function isDemoMode(): boolean {
  return getDb().kind === "memory";
}
