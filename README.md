# Paaji (working title) — NGO website

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

- Sign in at `/admin`. Roles: administrator (settings + staff), editor (content + gallery), reviewer (donations + inbox). Every protected API enforces roles server-side.
- **Checklist** (`/admin/dashboard/checklist`, private): live launch-readiness computed from data + integrations.
- **Gallery**: upload (JPG/PNG/WebP, 10 at once, unpublished by default), edit alt/caption/album, publish toggle, reorder, delete with confirmation.
- **Settings**: contact details, display/legal name, `donationsEnabled` + `pickupEnabled` switches. Payment fields stay empty until verified. All changes audited.
- **Donations**: review queue only matters after donations open. Confirmations require matching a real bank credit; double-confirm is blocked.

## Production setup

1. Supabase project → run `supabase/migrations/001_initial.sql` → private `proofs` bucket.
2. Env (Vercel or `.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_DEMO_MODE=false`, `SESSION_SECRET` (32+ random chars), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SMTP_*` for real email, `NEXT_PUBLIC_SITE_URL` = public URL.
3. Sign in once, create named staff, rotate the bootstrap credential.
4. Only enable `donationsEnabled` after the bank account is active AND verified UPI/bank details + client QR are published in Settings.

## What was verified

`tsc`, production `next build`, and `scripts/verify-workflows.mjs` (22 checks: payment lock 503s, opening-soon page without payment details, draft privacy 404s, volunteer email-or-phone validation, form persistence honesty, gallery upload auth + validation, checklist gating, role enforcement, event capacity, public page loads).

## Still needed / unconfigured

- All client content in `CONTENT-CHECKLIST.md` (private, repo-only — never published).
- Supabase + SMTP (demo store + logged email until then).
- Razorpay: not integrated by design in this phase; code structure reserves server-side order/signature handling for later.
- Hindi switch: hidden until reviewed translations exist.
