# Shikshaa Sewa Charitable Trust — website

Next.js 14 + TypeScript + Tailwind. Demo-mode JSON store (`data/*.json`), Supabase-ready schema in `supabase/migrations/`, Vercel-compatible. No build step beyond `npm run build`.

## Current posture (important)

- **Online donations are DISABLED** — server-enforced via `donationsEnabled: false` in settings. Payment routes return 503; the Donate page shows an "opening soon" state; the header links to a Support page (volunteer / supplies / contact).
- **Sample content lives in draft** — programmes, campaigns, events, stories, articles, testimonials, team, supply needs and volunteer roles have no approved content, so public pages show honest empty states. Only the gallery (13 client photos) is live.
- **Display name "Paaji" is a working title** — client photos show "Shikshaa Sewa Charitable Trust". `displayName` and `legalName` are separate settings; the legal name is empty until confirmed. Do not guess.

## Run locally

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
# site: http://localhost:3000
# admin: http://localhost:3000/admin  (bootstrap via ADMIN_EMAIL / ADMIN_PASSWORD in .env.local, then change it)
```

Note: this repo lives in a OneDrive-synced folder, which breaks Next's dev file
watcher (stale 404s / `EINVAL readlink` in `.next`). If `npm run dev` misbehaves,
stop it, delete `.next`, and restart. For day-to-day review `npm run build` +
`npm start` is the reliable path.

Other checks: `npx tsc --noEmit`, `npm run build`, `node scripts/verify-workflows.mjs` (needs the server running; set `BASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).

Add gallery photos: drop originals into `public/images/gallery/` (subfolders become albums), run `powershell -ExecutionPolicy Bypass -File scripts/sync-gallery.ps1`, then set alt text in Admin > Content > gallery (or `data/gallery.json`).

## Admin guide (short)

- Sign in at `/admin/login` (a discreet link sits in the footer). No public registration exists.
- **First admin**: with an empty staff store, signing in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from env bootstraps the administrator — then create named staff in Admin > Staff and remove/rotate the bootstrap credential. Never commit real passwords; all secrets live in env only.
- **Password reset**: staff use “Forgot password” (emailed link, 1-hour token, only when SMTP is configured); otherwise an administrator sets passwords directly in Admin > Staff. Every reset is audit-logged.
- Roles: administrator (settings + staff), editor (content + gallery), reviewer (donations + inbox). Every protected API enforces roles server-side.
- **Checklist** (`/admin/dashboard/checklist`, private): live launch-readiness computed from data + integrations.
- **Gallery**: upload (JPG/PNG/WebP, 10 at once, unpublished by default), edit alt/caption/album, publish toggle, reorder, delete with confirmation.
- **Settings**: contact details, display/legal name, `donationsEnabled` + `pickupEnabled` switches. Payment fields stay empty until verified. All changes audited.
- **Donations**: review queue only matters after donations open. Confirmations require matching a real bank credit; double-confirm is blocked.

## Production setup

## Data storage (persistent database)

Submission records (volunteers, enquiries, pledges, registrations, donations, outbox, audit, staff) use `lib/store.ts`, which writes to **Supabase Postgres automatically when `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set**, and falls back to local `data/*.json` otherwise. Mapping lives in `lib/dbmap.ts`. Public content collections stay in JSON for now.

1. Supabase project → run migrations in order: `001_initial.sql`, `002_gallery_videos.sql`, `003_notifications.sql`, `004_staff_pledges_review.sql` → private `proofs` bucket (+ `gallery`, `gallery-originals` when wiring uploads).
2. Env (Vercel or `.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (service role, server-only — never the anon key for writes), `NEXT_PUBLIC_DEMO_MODE=false`, `SESSION_SECRET` (32+ random chars), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NOTIFICATION_EMAIL` (or set in Admin > Settings), `RESEND_API_KEY`, `EMAIL_FROM` (verified sender), `APP_URL` (= public URL, used for admin links in emails), `CRON_SECRET` (optional, for scheduled retries), `NEXT_PUBLIC_SITE_URL` = public URL. All secrets stay server-side; nothing secret is ever in browser code or committed.
3. Sign in once, create named staff, rotate the bootstrap credential.
4. Only enable `donationsEnabled` after the bank account is active AND verified UPI/bank details + client QR are published in Settings.

## What was verified

`tsc`, production `next build`, and `scripts/verify-workflows.mjs` (22 checks: payment lock 503s, opening-soon page without payment details, draft privacy 404s, volunteer email-or-phone validation, form persistence honesty, gallery upload auth + validation, checklist gating, role enforcement, event capacity, public page loads).

## Email notifications (Resend, outbox)

Every public form saves first, then queues emails in a durable outbox (`data/outbox.json`, prepared table `003_notifications.sql`):
- Provider chain: **Resend** (`RESEND_API_KEY`) → SMTP fallback (`SMTP_HOST/USER/PASS`) → recorded failure. Sender is `EMAIL_FROM` (must be verified at the provider), submitter's address goes in Reply-To, never From.
- Staff notification to `adminNotificationEmail` (Settings) or `ADMIN_NOTIFICATION_EMAIL`, with Reply-To set to the submitter. Confirmed-donation notices are queued only after staff verification.
- Submitter acknowledgement (only when they gave an email address).
- Bounded retries (3 attempts: 1 min, 10 min, 1 h). Failures never undo the saved submission and never claim delivery. Retry reuses the same job — no duplicates. Admin > Notifications shows pending/sent/failed with a retry action; provider acceptance (message ID) is recorded but is not proof of delivery.
- Requests process the outbox inline (awaited — safe on serverless). For retries while nobody submits, call `GET/POST /api/cron/outbox` with `Authorization: Bearer CRON_SECRET` from any scheduler (e.g. GitHub Actions cron, cron-job.org). Vercel Cron cannot send custom headers, so use an external scheduler.
- Without credentials nothing is sent and jobs record the honest failure — the site keeps working and forms keep saving.

### Setting up Resend
1. Sign up at resend.com → add and verify your sender domain (DNS records) → create an API key (store only in env, never commit).
2. Set `RESEND_API_KEY`, `EMAIL_FROM="Shikshaa Sewa <hello@your-verified-domain>"`, `ADMIN_NOTIFICATION_EMAIL`, `APP_URL=https://your-site-url`.
3. Submit a test form, then check Admin > Notifications for `sent` + message ID.

## Still needed / unconfigured

- All client content in `CONTENT-CHECKLIST.md` (private, repo-only — never published).
- Supabase + SMTP credentials (see env list above) for persistent data and real delivery.
- A verified sender domain/address for `SMTP_FROM` at the email provider.
- Razorpay: not integrated by design in this phase; code structure reserves server-side order/signature handling for later.
- Hindi switch: hidden until reviewed translations exist.
