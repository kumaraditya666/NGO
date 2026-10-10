# [NGO NAME] — website (first release)

Premium, human, credible NGO site: Next.js 14 + TypeScript + Tailwind, demo-mode JSON store, Supabase-ready, Vercel-compatible.

## Quick start (demo mode, no credentials needed)

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
# open http://localhost:3000
# admin: http://localhost:3000/admin  (admin@example.org / ChangeMe123! — change immediately)
```

Demo mode = local `data/*.json` store, uploads in `data/proofs/` (private, never in `public/`), emails logged to console.

## Production setup

1. Create Supabase project → run `supabase/migrations/001_initial.sql` → create private bucket `proofs`.
2. Set env (Vercel or `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_DEMO_MODE=false`
   - `SESSION_SECRET` (≥32 random chars), `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - `SMTP_HOST/PORT/USER/PASS/FROM` for real email
3. `npm run build; npm start`
4. Sign in once with bootstrap admin → Admin → Staff → add real staff, delete/change bootstrap password.
5. Admin → Settings: paste **client-verified** UPI ID, bank details, upload client QR (never reuse reference site's QR).
6. Replace all sample content (see Transparency → Launch checklist).

## First administrator (secure)

- Staff are stored hashed (scrypt). If `data/staff.json` is empty, login with `ADMIN_EMAIL/ADMIN_PASSWORD` bootstraps one administrator automatically.
- Then create named staff with roles (administrator / editor / reviewer) and remove the bootstrap credential from env.

## Admin guide (short)

- **Overview**: confirmed total vs pending — pending never counts.
- **Donations**: filter by status, search ref/name/UTR. Open proof (staff only). Enter *verified amount* + note → Confirm only after matching bank credit. Rejected never counts. Double-confirm is blocked (409). CSV export is staff-only and contains PII — handle carefully.
- **Inbox**: volunteers / enquiries / pledges / registrations → new → reviewing → accepted/declined/done.
- **Content**: JSON editor for programs, campaigns, events, stories, articles, gallery, team, reports, FAQs. `state/publish=draft` stays private.
- **Settings** (admin only, audited): contact + payment details.
- **Audit**: every donation decision + settings/staff change.

## Donation model (manual verification)

Donor → create (awaiting_payment) → pay externally → submit UTR (submitted_for_verification) → staff confirm/reject. Only `confirmed` counts toward campaign totals; website-online and offline-verified are shown separately, never double-counted. Acknowledgements are plain (not tax certificates).

## Scripts

- `npm run typecheck`, `npm run build`, `npm run test:workflows` (needs `npm run start` running + `BASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).

## Remaining blockers / honest demo notes

- Supabase + SMTP unconfigured → local store + logged email (see banner).
- All numbers, stories, testimonials, QR, bank details are **samples** — client must verify.
- Hindi switch hidden until reviewed translations exist.
- Future (not built): donor login, recurring gifts, attendance, certificates, personal fundraising.
