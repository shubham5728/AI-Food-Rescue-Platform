import { MemoryRepository } from "./memory";
import type { Repository } from "./repository";

let instance: Repository | null = null;

/**
 * Returns the active in-memory repository instance.
 */
export function getDb(): Repository {
  if (!instance) {
    instance = new MemoryRepository();
  }
  return instance;
}

export function isDemoMode(): boolean {
  return true;
}
