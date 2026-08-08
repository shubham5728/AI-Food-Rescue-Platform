-- ============================================================================
-- FoodBridge AI — Supabase schema
--
-- Paste into the Supabase SQL editor and run. Then set NEXT_PUBLIC_SUPABASE_URL
-- and SUPABASE_SERVICE_ROLE_KEY in .env.local and run `npm run seed:supabase`
-- to load the same demo dataset the in-memory store uses.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id          text primary key,
  email       text not null unique,
  role        text not null check (role in ('donor', 'recipient')),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- organisations
-- ---------------------------------------------------------------------------
create table if not exists public.organisations (
  id                    text primary key,
  user_id               text not null references public.users (id) on delete cascade,
  name                  text not null,
  type                  text not null,
  role                  text not null check (role in ('donor', 'recipient')),
  contact_person        text not null default '',
  phone                 text not null default '',
  email                 text not null default '',
  address               text not null default '',
  latitude              double precision not null,
  longitude             double precision not null,
  verified              boolean not null default false,

  -- Recipient-only columns; null for donors.
  capacity_min          integer,
  capacity_max          integer,
  typical_quantity      integer,
  dietary_requirements  text[] not null default '{}',
  accepted_food_types   text[] not null default '{}',
  excluded_allergens    text[] not null default '{}',
  pickup_radius_km      numeric,
  can_pickup            boolean not null default false,
  pickup_lead_time_min  integer,
  reliability           numeric not null default 0.8 check (reliability between 0 and 1),

  created_at            timestamptz not null default now()
);

create index if not exists organisations_role_idx on public.organisations (role);
create index if not exists organisations_user_idx on public.organisations (user_id);

-- ---------------------------------------------------------------------------
-- donations
-- ---------------------------------------------------------------------------
create table if not exists public.donations (
  id                      text primary key,
  donor_id                text not null references public.organisations (id) on delete cascade,

  food_name               text not null,
  food_type               text not null,
  quantity                numeric not null check (quantity > 0),
  quantity_unit           text not null,
  meals                   integer not null check (meals > 0),
  weight_kg               numeric not null default 0,
  dietary_type            text not null check (dietary_type in ('vegetarian', 'vegan', 'non_vegetarian')),
  allergens               text[] not null default '{}',

  prepared_at             timestamptz not null,
  pickup_start            timestamptz not null,
  pickup_deadline         timestamptz not null,
  latitude                double precision not null,
  longitude               double precision not null,
  address                 text not null default '',
  notes                   text,

  status                  text not null default 'available'
                            check (status in ('available', 'matched', 'pickup_scheduled',
                                              'picked_up', 'delivered', 'cancelled')),
  matched_recipient_id    text references public.organisations (id) on delete set null,

  waste_risk_score        integer not null default 0 check (waste_risk_score between 0 and 100),
  waste_risk_level        text not null default 'LOW' check (waste_risk_level in ('LOW', 'MEDIUM', 'HIGH')),
  waste_risk_reasons      text[] not null default '{}',
  waste_risk_explanation  text not null default '',

  priority_score          integer not null default 0 check (priority_score between 0 and 100),
  priority_level          text not null default 'LOW' check (priority_level in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  priority_reason         text not null default '',

  ai_source               text not null default 'engine' check (ai_source in ('engine', 'openai')),
  analysed_at             timestamptz,

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  constraint pickup_window_valid check (pickup_deadline > pickup_start)
);

create index if not exists donations_status_idx on public.donations (status);
create index if not exists donations_donor_idx on public.donations (donor_id);
create index if not exists donations_recipient_idx on public.donations (matched_recipient_id);
create index if not exists donations_deadline_idx on public.donations (pickup_deadline);

-- ---------------------------------------------------------------------------
-- matches — the AI's ranked recommendations, rewritten on every analysis pass
-- ---------------------------------------------------------------------------
create table if not exists public.matches (
  id               text primary key,
  donation_id      text not null references public.donations (id) on delete cascade,
  recipient_id     text not null references public.organisations (id) on delete cascade,
  match_score      integer not null check (match_score between 0 and 100),
  explanation      text not null default '',
  reasons          text[] not null default '{}',
  rank             integer not null,
  distance_km      numeric not null default 0,
  time_buffer_min  integer not null default 0,
  ai_source        text not null default 'engine' check (ai_source in ('engine', 'openai')),
  created_at       timestamptz not null default now(),

  unique (donation_id, recipient_id)
);

create index if not exists matches_donation_idx on public.matches (donation_id, rank);
create index if not exists matches_recipient_idx on public.matches (recipient_id);

-- ---------------------------------------------------------------------------
-- donation_status_history — append-only lifecycle audit trail
-- ---------------------------------------------------------------------------
create table if not exists public.donation_status_history (
  id           text primary key,
  donation_id  text not null references public.donations (id) on delete cascade,
  status       text not null,
  note         text,
  created_at   timestamptz not null default now()
);

create index if not exists history_donation_idx
  on public.donation_status_history (donation_id, created_at);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The app's API routes connect with the service-role key, which bypasses RLS.
-- These policies govern anything reaching Postgres with the anon key: the
-- directory of verified organisations and open donations is public (that is
-- the point of the platform), and nothing is writable from the browser.
-- ---------------------------------------------------------------------------
alter table public.users                  enable row level security;
alter table public.organisations          enable row level security;
alter table public.donations              enable row level security;
alter table public.matches                enable row level security;
alter table public.donation_status_history enable row level security;

drop policy if exists "verified organisations are public" on public.organisations;
create policy "verified organisations are public"
  on public.organisations for select
  using (verified = true);

drop policy if exists "open donations are public" on public.donations;
create policy "open donations are public"
  on public.donations for select
  using (status <> 'cancelled');

drop policy if exists "matches are readable" on public.matches;
create policy "matches are readable"
  on public.matches for select
  using (true);

drop policy if exists "history is readable" on public.donation_status_history;
create policy "history is readable"
  on public.donation_status_history for select
  using (true);

-- public.users has no policy at all: it is service-role only.
