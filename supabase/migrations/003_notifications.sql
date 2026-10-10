-- 003: notification outbox (prepared for a future Supabase move).
-- The app currently runs on the local JSON store (data/outbox.json); this table
-- is NOT wired yet. See 002_gallery_videos.sql notes for the migration approach.

create table if not exists notification_outbox (
  id text primary key,
  key text unique not null,
  purpose text not null check (purpose in ('admin-notify', 'submitter-ack', 'donation-update')),
  ref_kind text not null,
  ref_id text not null,
  recipient text not null,
  subject text not null,
  body_html text not null,
  body_text text not null,
  reply_to text,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'failed')),
  attempts int not null default 0,
  max_attempts int not null default 3,
  next_attempt_at timestamptz default now(),
  last_error text,
  provider_message_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists notification_outbox_status_idx on notification_outbox(status, next_attempt_at);

-- No public read: submissions and notification metadata are staff-only.
-- Service role manages rows; anon has no access (deny-by-default, no policies).
alter table notification_outbox enable row level security;
