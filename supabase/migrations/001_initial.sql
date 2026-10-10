-- NGO schema for Supabase (run when moving off demo-mode JSON store).
-- Demo mode uses data/*.json with the same shapes; this migration mirrors it in Postgres.

create table if not exists programs (
  id text primary key, slug text unique not null, title text not null,
  summary text, description text, location text, challenge text,
  activities jsonb default '[]', goals jsonb default '[]', outcomes text,
  image text, state text default 'draft', "order" int default 0
);
create table if not exists campaigns (
  id text primary key, slug text unique not null, title text not null,
  summary text, purpose text, budget jsonb default '[]',
  goal_amount int default 0, offline_confirmed int default 0,
  deadline date, program_id text references programs(id),
  state text default 'active', publish text default 'draft',
  image text, created_at timestamptz default now()
);
create table if not exists campaign_updates (
  id text primary key, campaign_id text references campaigns(id) on delete cascade,
  date date, title text, body text, image text
);
create table if not exists donations (
  id text primary key, reference text unique not null,
  name text not null, email text not null, phone text,
  fund_type text not null, fund_id text, amount int not null,
  message text, anonymous boolean default false,
  status text not null default 'awaiting_payment',
  utr text, paid_at date, proof_path text,
  cannot_find_ref boolean default false, verified_amount int,
  ack_number text unique, reviewer text, reviewed_at timestamptz,
  internal_note text, token text not null,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create unique index if not exists donations_utr_unique on donations(utr) where utr is not null and utr <> '';
create table if not exists donation_history (
  id text primary key, donation_id text references donations(id) on delete cascade,
  "from" text, "to" text, "by" text, note text, at timestamptz default now()
);
create table if not exists volunteers (
  id text primary key, name text, email text, phone text, location text,
  skills text, interests text, availability text, program_id text, event_id text,
  message text, status text default 'new', created_at timestamptz default now()
);
create table if not exists events (
  id text primary key, slug text unique not null, title text, description text,
  date date, time text, location text, map_url text, capacity int default 50,
  registered int default 0, image text, state text default 'upcoming', publish text default 'draft'
);
create table if not exists registrations (
  id text primary key, event_id text references events(id) on delete cascade,
  name text, email text, phone text, seats int default 1, created_at timestamptz default now()
);
create table if not exists enquiries (
  id text primary key, kind text, name text, email text, phone text,
  subject text, message text, status text default 'new', created_at timestamptz default now()
);
create table if not exists settings (id int primary key, data jsonb);
create table if not exists audit_log (
  id text primary key, at timestamptz default now(), "by" text, action text,
  entity text, entity_id text, detail text
);
-- RLS: public read only for published content; writes via service role only
alter table programs enable row level security;
alter table campaigns enable row level security;
alter table events enable row level security;
create policy "public published programs" on programs for select using (state = 'published');
create policy "public published campaigns" on campaigns for select using (publish = 'published');
create policy "public published events" on events for select using (publish = 'published');
-- donations/volunteers/enquiries/registrations: no public read; service-role only
alter table donations enable row level security;
alter table volunteers enable row level security;
alter table enquiries enable row level security;
alter table registrations enable row level security;
-- storage: create private bucket `proofs` (no public read) in Supabase dashboard; serve via signed URLs to staff only
