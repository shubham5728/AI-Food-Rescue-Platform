import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type {
  Donation,
  DonationStatusHistory,
  Match,
  Organisation,
  User,
} from "@/lib/types";

import type { DonationFilter, Repository } from "./repository";

/**
 * Supabase adapter.
 *
 * The domain types already use snake_case, so rows map straight across with no
 * translation layer. API routes run server-side with the service-role key,
 * which bypasses RLS; the policies in supabase/schema.sql govern anything that
 * reaches Postgres with the anon key instead.
 */

export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export function isSupabaseConfigured(): boolean {
  return supabaseConfig() !== null;
}

function fail(context: string, error: { message: string } | null): never {
  throw new Error(`Supabase ${context} failed: ${error?.message ?? "unknown error"}`);
}

export class SupabaseRepository implements Repository {
  readonly kind = "supabase" as const;
  private client: SupabaseClient;

  constructor() {
    const config = supabaseConfig();
    if (!config) throw new Error("Supabase is not configured");
    this.client = createClient(config.url, config.key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async getUserById(id: string) {
    const { data, error } = await this.client
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) fail("getUserById", error);
    return (data as User) ?? null;
  }

  async getUserByEmail(email: string) {
    const { data, error } = await this.client
      .from("users")
      .select("*")
      .ilike("email", email.trim())
      .maybeSingle();
    if (error) fail("getUserByEmail", error);
    return (data as User) ?? null;
  }

  async createUser(user: User) {
    const { data, error } = await this.client
      .from("users")
      .insert(user)
      .select()
      .single();
    if (error) fail("createUser", error);
    return data as User;
  }

  async getOrganisationById(id: string) {
    const { data, error } = await this.client
      .from("organisations")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) fail("getOrganisationById", error);
    return (data as Organisation) ?? null;
  }

  async getOrganisationByUserId(userId: string) {
    const { data, error } = await this.client
      .from("organisations")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) fail("getOrganisationByUserId", error);
    return (data as Organisation) ?? null;
  }

  async listOrganisations(role?: Organisation["role"]) {
    let query = this.client.from("organisations").select("*").order("name");
    if (role) query = query.eq("role", role);
    const { data, error } = await query;
    if (error) fail("listOrganisations", error);
    return (data ?? []) as Organisation[];
  }

  async createOrganisation(org: Organisation) {
    const { data, error } = await this.client
      .from("organisations")
      .insert(org)
      .select()
      .single();
    if (error) fail("createOrganisation", error);
    return data as Organisation;
  }

  async createDonation(donation: Donation) {
    const { data, error } = await this.client
      .from("donations")
      .insert(donation)
      .select()
      .single();
    if (error) fail("createDonation", error);
    return data as Donation;
  }

  async getDonationById(id: string) {
    const { data, error } = await this.client
      .from("donations")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) fail("getDonationById", error);
    return (data as Donation) ?? null;
  }

  async updateDonation(id: string, patch: Partial<Donation>) {
    const { data, error } = await this.client
      .from("donations")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) fail("updateDonation", error);
    return data as Donation;
  }

  async listDonations(filter?: DonationFilter) {
    let query = this.client
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter?.donor_id) query = query.eq("donor_id", filter.donor_id);
    if (filter?.matched_recipient_id)
      query = query.eq("matched_recipient_id", filter.matched_recipient_id);
    if (filter?.status) query = query.in("status", filter.status);
    if (filter?.activeOnly)
      query = query.not("status", "in", "(delivered,cancelled)");

    const { data, error } = await query;
    if (error) fail("listDonations", error);
    return (data ?? []) as Donation[];
  }

  async replaceMatches(donationId: string, matches: Match[]) {
    const { error: deleteError } = await this.client
      .from("matches")
      .delete()
      .eq("donation_id", donationId);
    if (deleteError) fail("replaceMatches (delete)", deleteError);

    if (matches.length === 0) return;

    const { error } = await this.client.from("matches").insert(matches);
    if (error) fail("replaceMatches (insert)", error);
  }

  async listMatches(donationId: string) {
    const { data, error } = await this.client
      .from("matches")
      .select("*")
      .eq("donation_id", donationId)
      .order("rank");
    if (error) fail("listMatches", error);
    return (data ?? []) as Match[];
  }

  async listMatchesForRecipient(recipientId: string) {
    const { data, error } = await this.client
      .from("matches")
      .select("*")
      .eq("recipient_id", recipientId)
      .order("match_score", { ascending: false });
    if (error) fail("listMatchesForRecipient", error);
    return (data ?? []) as Match[];
  }

  async appendHistory(entry: DonationStatusHistory) {
    const { error } = await this.client
      .from("donation_status_history")
      .insert(entry);
    if (error) fail("appendHistory", error);
  }

  async listHistory(donationId: string) {
    const { data, error } = await this.client
      .from("donation_status_history")
      .select("*")
      .eq("donation_id", donationId)
      .order("created_at");
    if (error) fail("listHistory", error);
    return (data ?? []) as DonationStatusHistory[];
  }
}
