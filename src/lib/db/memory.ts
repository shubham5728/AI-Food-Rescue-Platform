import type {
  Donation,
  DonationStatusHistory,
  Match,
  Organisation,
  User,
} from "@/lib/types";

import { matchesFilter, type DonationFilter, type Repository } from "./repository";
import { buildSeed } from "./seed";

/**
 * In-memory store used whenever Supabase credentials are absent.
 *
 * It exists so the platform can be cloned and demonstrated with zero setup.
 * State is held on `globalThis` so it survives Next.js hot reloads in
 * development; it does not survive a server restart, and it is not shared
 * between serverless instances — which is why the README points at Supabase
 * for anything beyond a local demo.
 */

interface Store {
  users: Map<string, User>;
  organisations: Map<string, Organisation>;
  donations: Map<string, Donation>;
  matches: Map<string, Match[]>;
  history: DonationStatusHistory[];
}

const GLOBAL_KEY = Symbol.for("foodbridge.memory.store");

function loadStore(): Store {
  const holder = globalThis as unknown as Record<symbol, Store | undefined>;
  if (holder[GLOBAL_KEY]) return holder[GLOBAL_KEY]!;

  const seed = buildSeed(new Date());
  const store: Store = {
    users: new Map(seed.users.map((u) => [u.id, u])),
    organisations: new Map(seed.organisations.map((o) => [o.id, o])),
    donations: new Map(seed.donations.map((d) => [d.id, d])),
    matches: new Map(),
    history: [...seed.history],
  };

  holder[GLOBAL_KEY] = store;
  return store;
}

const clone = <T>(value: T): T => structuredClone(value);

export class MemoryRepository implements Repository {
  readonly kind = "memory" as const;

  private get store(): Store {
    return loadStore();
  }

  async getUserById(id: string) {
    return clone(this.store.users.get(id) ?? null);
  }

  async getUserByEmail(email: string) {
    const normalised = email.trim().toLowerCase();
    for (const user of this.store.users.values()) {
      if (user.email.toLowerCase() === normalised) return clone(user);
    }
    return null;
  }

  async createUser(user: User) {
    this.store.users.set(user.id, user);
    return clone(user);
  }

  async getOrganisationById(id: string) {
    return clone(this.store.organisations.get(id) ?? null);
  }

  async getOrganisationByUserId(userId: string) {
    for (const org of this.store.organisations.values()) {
      if (org.user_id === userId) return clone(org);
    }
    return null;
  }

  async listOrganisations(role?: Organisation["role"]) {
    const all = [...this.store.organisations.values()];
    const filtered = role ? all.filter((o) => o.role === role) : all;
    return clone(filtered.sort((a, b) => a.name.localeCompare(b.name)));
  }

  async createOrganisation(org: Organisation) {
    this.store.organisations.set(org.id, org);
    return clone(org);
  }

  async createDonation(donation: Donation) {
    this.store.donations.set(donation.id, donation);
    return clone(donation);
  }

  async getDonationById(id: string) {
    return clone(this.store.donations.get(id) ?? null);
  }

  async updateDonation(id: string, patch: Partial<Donation>) {
    const existing = this.store.donations.get(id);
    if (!existing) throw new Error(`Donation ${id} not found`);
    const updated: Donation = {
      ...existing,
      ...patch,
      updated_at: new Date().toISOString(),
    };
    this.store.donations.set(id, updated);
    return clone(updated);
  }

  async listDonations(filter?: DonationFilter) {
    const all = [...this.store.donations.values()].filter((d) =>
      matchesFilter(d, filter),
    );
    all.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    return clone(all);
  }

  async replaceMatches(donationId: string, matches: Match[]) {
    this.store.matches.set(donationId, clone(matches));
  }

  async listMatches(donationId: string) {
    return clone(
      [...(this.store.matches.get(donationId) ?? [])].sort(
        (a, b) => a.rank - b.rank,
      ),
    );
  }

  async listMatchesForRecipient(recipientId: string) {
    const out: Match[] = [];
    for (const list of this.store.matches.values()) {
      for (const m of list) if (m.recipient_id === recipientId) out.push(m);
    }
    return clone(out.sort((a, b) => b.match_score - a.match_score));
  }

  async appendHistory(entry: DonationStatusHistory) {
    this.store.history.push(entry);
  }

  async listHistory(donationId: string) {
    return clone(
      this.store.history
        .filter((h) => h.donation_id === donationId)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        ),
    );
  }
}
