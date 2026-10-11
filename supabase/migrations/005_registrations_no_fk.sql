-- 005: drop the registrations -> events foreign key.
-- Events remain curated content served from the app's JSON store, while
-- registrations live in Postgres. The API already validates that the event
-- exists (and enforces capacity) before inserting, so the FK only breaks
-- legitimate writes against an empty events table.
alter table registrations drop constraint if exists registrations_event_id_fkey;
