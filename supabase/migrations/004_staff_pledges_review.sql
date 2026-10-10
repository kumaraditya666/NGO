-- 004: staff, supply pledges, review metadata, donation test flag.
-- Supplements 001–003 so every submission path in lib/dbmap.ts has a table.

create table if not exists staff (
  id text primary key,
  email text unique not null,
  name text,
  role text not null check (role in ('administrator', 'editor', 'reviewer')),
  salt text not null,
  hash text not null,
  reset_hash text,
  reset_exp bigint,
  created_at timestamptz default now()
);

create table if not exists inkind_pledges (
  id text primary key,
  kind text default 'inkind-pledge',
  name text,
  email text,
  phone text,
  subject text,
  message text,
  status text default 'new',
  reviewed_by text,
  reviewed_at timestamptz,
  staff_note text,
  created_at timestamptz default now()
);

-- Review workflow columns on submission tables.
alter table volunteers add column if not exists reviewed_by text;
alter table volunteers add column if not exists reviewed_at timestamptz;
alter table volunteers add column if not exists staff_note text;
alter table enquiries add column if not exists reviewed_by text;
alter table enquiries add column if not exists reviewed_at timestamptz;
alter table enquiries add column if not exists staff_note text;
alter table registrations add column if not exists status text default 'new';
alter table registrations add column if not exists reviewed_by text;
alter table registrations add column if not exists reviewed_at timestamptz;
alter table registrations add column if not exists staff_note text;

-- Test/demo donations excluded from every public total.
alter table donations add column if not exists test_record boolean default false;

-- Staff-only: no public read on any of these (service role only, deny-by-default).
alter table staff enable row level security;
alter table inkind_pledges enable row level security;
