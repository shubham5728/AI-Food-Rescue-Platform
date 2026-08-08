import { TERMINAL_STATUSES } from "@/lib/constants";
import type {
  Donation,
  DonationStatus,
  DonationStatusHistory,
  Match,
  Organisation,
  User,
} from "@/lib/types";

/**
 * Storage contract.
 *
 * Two implementations satisfy it: an in-memory store used when no Supabase
 * credentials are present, and the Supabase adapter used in deployment. All
 * business logic sits above this line so neither backend owns any rules.
 */

export interface DonationFilter {
  donor_id?: string;
  matched_recipient_id?: string;
  status?: DonationStatus[];
  /** Excludes delivered and cancelled donations. */
  activeOnly?: boolean;
}

export interface Repository {
  readonly kind: "memory" | "supabase" | "sqlite";

  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: User): Promise<User>;

  getOrganisationById(id: string): Promise<Organisation | null>;
  getOrganisationByUserId(userId: string): Promise<Organisation | null>;
  listOrganisations(role?: Organisation["role"]): Promise<Organisation[]>;
  createOrganisation(org: Organisation): Promise<Organisation>;

  createDonation(donation: Donation): Promise<Donation>;
  getDonationById(id: string): Promise<Donation | null>;
  updateDonation(id: string, patch: Partial<Donation>): Promise<Donation>;
  listDonations(filter?: DonationFilter): Promise<Donation[]>;

  replaceMatches(donationId: string, matches: Match[]): Promise<void>;
  listMatches(donationId: string): Promise<Match[]>;
  listMatchesForRecipient(recipientId: string): Promise<Match[]>;

  appendHistory(entry: DonationStatusHistory): Promise<void>;
  listHistory(donationId: string): Promise<DonationStatusHistory[]>;
}

export function matchesFilter(d: Donation, filter?: DonationFilter): boolean {
  if (!filter) return true;
  if (filter.donor_id && d.donor_id !== filter.donor_id) return false;
  if (
    filter.matched_recipient_id &&
    d.matched_recipient_id !== filter.matched_recipient_id
  )
    return false;
  if (filter.status && !filter.status.includes(d.status)) return false;
  if (filter.activeOnly && TERMINAL_STATUSES.includes(d.status))
    return false;
  return true;
}
