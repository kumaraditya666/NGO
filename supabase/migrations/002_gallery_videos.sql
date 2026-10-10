-- 002: gallery + featured videos tables (prepared for a future Supabase move).
-- The app currently runs on the local JSON store; these tables are NOT wired
-- yet. When Supabase is connected, migrate data/gallery.json and
-- data/videos.json into these tables and point lib/content.ts at them.

create table if not exists gallery_items (
  id text primary key,
  title text default '',
  category text default 'All Photos',
  image text not null,
  thumb text default '',
  caption text default '',
  alt text default '',
  width int,
  height int,
  "order" int default 0,
  published boolean default true,
  featured boolean default false,
  taken_at text default '',
  taken_where text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists video_items (
  id text primary key,
  title text not null,
  caption text default '',
  platform text not null check (platform in ('youtube', 'instagram')),
  url text not null,
  cover text not null,
  cover_alt text default '',
  "order" int default 0,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- No public read: website content is served through the app's own API layer
-- after staff publish it. Service role manages rows; anon has no access.
alter table gallery_items enable row level security;
alter table video_items enable row level security;
-- (No policies: deny-by-default. Add narrowly-scoped policies only if a
-- direct client read path is ever introduced.)

-- Storage (create in the Supabase dashboard when wiring uploads):
--   bucket `gallery` (public read for published display versions)
--   bucket `gallery-originals` (private; staff upload target)
--   bucket `proofs` already documented in 001_initial.sql (private)
