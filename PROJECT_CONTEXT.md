# PROJECT_CONTEXT.md — Shikshaa Sewa Charitable Trust website
> Handoff written 2026-10-11. Source of truth for continuing work. Verify against actual project files before acting.

## 1. PROJECT OVERVIEW
- **What**: A complete, public-facing NGO website for **Shikshaa Sewa Charitable Trust** (working title was "Paaji" early on; rebranded per client-supplied name, slogan, logo, Instagram).
- **Purpose**: Credible online presence — programmes, photo gallery, volunteer/contact/supply/event forms, transparency info, admin panel — with **online donations DISABLED** (NGO bank account pending, Razorpay pending).
- **Users**: General public (donors-to-be, volunteers, community), NGO staff (admin panel with roles).
- **Outcome expected**: Client-ready prototype that is honest everywhere (no invented figures/stories/registrations), deployable to Vercel, backed by Supabase when credentials exist.
- **Repo**: `C:\Users\Adi\OneDrive\paaji` (local) → GitHub `mauryakirti2308-ctrl/NGO` branch `main` (transferred from `kumaraditya666/NGO`; remote already repointed). Live (possibly stale): https://shikshasewa.vercel.app/
- **Local HEAD at handoff**: `efb6e87` ("Lighthouse fixes…") — verify with `git log --oneline -3` and `git status`.

## 2. REQUIREMENTS & PREFERENCES (user's, consolidated; latest wins)
- Design: warm cream `#FFFCF7`, brand blue `#176A9A`, orange accent `#F49A20`, green `#60AD43` restrained, ink text `#20313D`, navy `#0f2a43` panels; Fraunces serif display + Inter body; rounded-lg cards; subtle motion only; **reduced-motion respected everywhere**; no purple gradients/glassmorphism/3D.
- Slogan "Learn today, lead tomorrow" (hero H1, top bar, footer). Instagram https://www.instagram.com/shikshaasewa_charitabletrust/ (top bar 19px icon, footer + Contact follow links, target=_blank + noopener).
- Real client photography only (13 gallery photos supplied); illustrative SVGs removed from public pages; stock Unsplash photos in `public/photos/` are placeholders to replace.
- Donations stay **disabled** (server 503s, opening-soon page, Support Us page); never show QR/bank details until verified; no tax promises.
- Never invent achievements, testimonials, registrations, figures, team bios; unapproved content stays in **draft**; private checklists only (`CONTENT-CHECKLIST.md`, Admin → Checklist).
- Homepage order: header → magazine hero → visual intro → programs (if published) → videos (if published) → ways to help → curated gallery → blue volunteer closing → footer.
- Videos section hidden until approved links+covers exist (`data/videos.json` empty).
- Explicitly rejected: Google Forms embeds, donor accounts, AI chatbot, monthly/recurring billing UI, autoplay videos/embeds, fake sending, auto-deploy without instruction.
- Workflow: verify via build + `scripts/verify-workflows.mjs` (56 checks); commit locally; push/deploy **only when explicitly asked** (push triggers Vercel auto-deploy).

## 3. ARCHITECTURE
- **Stack**: Next.js 14.2 (App Router) + React 18 + TypeScript + Tailwind 3.4. Deps include `@supabase/supabase-js`, `nodemailer`, `resend`, `zod`.
- **Data layer**: `lib/store.ts` reads/writes `data/*.json` by default; transparently uses **Supabase Postgres** (service role) when `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set. Mapping in `lib/dbmap.ts`. Content collections (programs, gallery, etc.) stay JSON.
- **Migrations** (`supabase/migrations/`): 001 core tables, 002 gallery+videos, 003 outbox, 004 staff/pledges/review-cols/test-flag, 005 drops `registrations→events` FK (events live in JSON).
- **Email**: `lib/email.ts` — Resend (`RESEND_API_KEY`) → SMTP fallback → honest failure. Outbox (`lib/notify.ts` + `data/outbox.json`): idempotent jobs, 3 bounded retries, admin retry UI, Reply-To=submitter, user content escaped.
- **Auth**: custom cookie+HMAC+scrypt (`lib/auth.ts`), roles administrator/editor/reviewer enforced server-side (`lib/guard.ts`). Bootstrap admin from env when staff store empty. Password reset via emailed token (SMTP only) + admin direct-set.
- **Key routes**: public forms `/api/volunteer`, `/api/enquiries`, `/api/events/register`; donations `/api/donations/*` (503-locked); admin `/api/admin/*` (donations, inbox+export, gallery upload/delete, collections, settings, staff+password, audit, checklist, notifications+cron `/api/cron/outbox` w/ `CRON_SECRET`); gallery sync `scripts/sync-gallery.ps1` (ASCII-only!).
- **Admin pages**: `/admin/login` (+`/admin`, `/forgot`, `/reset`), dashboard overview counts, inbox (search/filter/pagination/detail/notes/CSV), donations queue, gallery manager, videos manager, content JSON editor, settings (incl. `donationsEnabled`, `adminNotificationEmail`), staff, audit, checklist, notifications.
- **Media**: `public/images/gallery/` (13 client originals + `thumbs/` + `large/` EXIF-free derivatives), `public/photos/` (7 stock placeholders), `public/logo.jpg` (38KB optimized client logo), `app/icon.png` (favicon from logo symbol).

## 4. IMPLEMENTATION STATUS
| Feature | Status | Notes / remaining |
|---|---|---|
| Public pages (home/about/programs/gallery/events/volunteer/etc.) | Completed | All render; drafts show honest empty states |
| Magazine homepage + entrance + accents | Completed | Committed `8489e5a` |
| Gallery + lightbox + admin manager | Completed | 13 real photos live |
| Videos infra (carousel, popup, validation, admin) | Completed | **No published videos — needs client URLs + covers** |
| Donation flow (QR/manual verify) | Completed but disabled | Locked by `donationsEnabled=false`; Razorpay future |
| Admin auth/roles/reset/audit | Completed | |
| Inbox (search/filter/CSV/notes) | Completed | |
| Outbox + Resend + Supabase adapter | Completed | Live delivery needs `RESEND_API_KEY` + verified `EMAIL_FROM`; DB needs Vercel env + redeploy |
| About page (approved content, 5 initiatives) | Completed | Committed `2467e4d` |
| Lighthouse fixes (next/image, logo.jpg, contrast) | Completed locally | Committed `efb6e87`; **not yet live (see §5)** |
| Logo in header | Completed (local) | `public/logo.jpg` live locally, not yet deployed |
| Vercel production deploy of latest | **Broken/pending** | Auto-deploy dead since repo transfer; user re-importing under new account |

## 5. EXACT CURRENT STATE (most important)
- **Working on**: getting the latest code live on Vercel after GitHub repo transferred to `mauryakirti2308-ctrl/NGO` (user is collaborator). Last push (`efb6e87`) succeeded to the new location; remote repointed. User was creating a **new Vercel project** importing the repo (screenshot showed import screen) and asked for **all env vars** — provided, plus generated `SESSION_SECRET`/`ADMIN_PASSWORD`/`CRON_SECRET` in chat.
- **Last completed**: logo.jpg swap + Lighthouse fixes committed `efb6e87`; pushed to GitHub; 6-min live-site poll showed old build (no auto-deploy).
- **What works**: everything locally (56/56 checks). Production deployment status unknown — user must finish the Vercel import.
- **Next step**: user finishes Vercel import with the env list, deploys, shares the live URL; then verify live (homepage, gallery, forms, admin, donations-locked).
- **Awaiting user**: Vercel project creation; Resend domain verification; video URLs+covers; legal/contact/program-detail content (see CONTENT-CHECKLIST.md).
- **Known quirk**: `git status` may show LF/CRLF warnings only — harmless.

## 6. ERRORS & DEBUGGING HISTORY
- **PowerShell 5.1 pitfalls (do NOT repeat mistakes)**: no `[IO.Path]::GetRelativePath`; `ConvertTo-Json` unwraps single-element arrays (use Node for JSON writes); `Set-Content`/`Out-File` add BOM → always no-BOM writes (`[IO.File]::WriteAllText` or node); keep `.ps1` files **pure ASCII** (a UTF-8 em-dash once broke script parsing invisibly); quote carefully in `node -e` (prefer the Edit tool over inline scripts).
- **`Invoke-WebRequest -Headers @{Cookie=...}` silently drops auth** → use `curl.exe` for authenticated checks.
- **Background servers die between tool calls**; always start server + test in ONE bash call via `Start-Job`.
- **OneDrive corrupts `.next`** (`EINVAL readlink`): stop server, delete `.next`, rebuild; `npm run build` + `next start` is the reliable path. (User later deactivated OneDrive sync.)
- **Unsplash CDN 404s in bursts** → switched to Wikimedia Commons + local files.
- **Supabase PGRST125**: user's Project URL had `/rest/v1/` appended — trimmed to `https://<ref>.supabase.co`.
- **Event reg 500 (code 23503)**: `registrations→events` FK vs empty events table → migration 005 drops it (user ran it; verified).
- **Resend refusing mail**: default `EMAIL_FROM hello@example.org` unverified → honest failure recorded (correct behavior, not a bug).
- **Mass file loss (OneDrive)**: recovered via `git checkout -- .` twice; repo now also has logo.jpg replacing logo.png.
- **Verify-script false fails before**: flight-comment regex artifacts, `vol-` vs `vol_` id mismatch — fixed.
- **Dev-server flakiness**: added `NEXT_DIST_DIR` support in `next.config.js` (unused default `.next`).

## 7. IMPORTANT CODE & CONFIG
- Env names (values live only in `.env.local`/Vercel, never chat): `NEXT_PUBLIC_SITE_NAME/URL/DEMO_MODE`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NOTIFICATION_EMAIL`, `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL`, `SMTP_*`, `CRON_SECRET`.
- Local admin bootstrap: `admin@example.org` / `ChangeMe123!` (dev only).
- Verify: `node scripts/verify-workflows.mjs` with `BASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` set; needs server running in same flow.
- Gallery: drop files in `public/images/gallery/` → `powershell -ExecutionPolicy Bypass -File scripts/sync-gallery.ps1` → set alts in Admin → Content → gallery.
- Test-data cleanup pattern: reset `data/{volunteers,enquiries,staff,audit,donations,donation_history,registrations,inkind_pledges,newsletter,outbox}.json` to `[]` via node (exact bytes), `git checkout -- data/events.json`; Supabase test rows deleted by `email LIKE '%test.co'` + outbox `recipient` filter.
- Key files: `lib/store.ts` (backend switch), `lib/dbmap.ts` (mappers), `lib/notify.ts` (outbox+esc), `lib/email.ts` (Resend→SMTP), `lib/guard.ts`, `components/VideoStories.tsx` (featured layout + popup), `components/GalleryClient.tsx` (lightbox), `scripts/sync-gallery.ps1`, `scripts/verify-workflows.mjs`.

## 8. DECISIONS & REASONS
- JSON store default + transparent Supabase switch (not full rewrite): zero call-site churn, works with and without credentials.
- Outbox over direct sends: honesty (no fake success), bounded retries, works on serverless (awaited inline + cron route; Vercel Cron can't send Bearer headers → external scheduler documented).
- Drafts over deletion for unapproved content; honest empty states everywhere.
- No Supabase reads for public content (stays JSON); only submissions/auth/outbox/audit go to Postgres.
- RLS deny-by-default everywhere; service key server-only.
- No push without explicit instruction (push = Vercel auto-deploy).
- Unresolved: favicon refinement, Hindi switch (hidden), Razorpay (future), custom domain for Resend sender.

## 9. NEXT STEPS (priority order)
1. **Immediate**: user finishes Vercel import (env list already given) → get live URL → verify live (hero, gallery, forms, admin login, donations-locked, no console errors).
2. Set production env on Vercel (Supabase URL+service key, `NEXT_PUBLIC_DEMO_MODE=false`, Resend key, verified `EMAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL`, `APP_URL`, `SESSION_SECRET`, strong `ADMIN_PASSWORD`) + redeploy; re-verify forms persist to Supabase.
3. Resend: verify sender domain; test end-to-end delivery.
4. Collect: video URLs+covers, programme details, impact figures, team, events, supply needs, legal/contact details (CONTENT-CHECKLIST.md).
5. Re-run Lighthouse on live URL; confirm 90+ Performance / 100 Accessibility.
6. Ongoing: keep test data out of commits; `git push` only on explicit approval.

## 10. RULES FOR THE NEXT AI
- Continue from repo state (`git log`, `git status` first); don't rebuild working features.
- Never invent NGO facts, figures, stories, or video URLs; drafts stay draft.
- Keep ASCII-only PowerShell scripts; no-BOM file writes; prefer Edit tool over inline `node -e` quoting.
- Use `curl.exe` (not IWR) for authenticated HTTP checks; run server+tests in a single bash call; clean test data afterward.
- Run `tsc --noEmit`, production `next build`, and the 56-check verify script after changes.
- Commit locally with clear messages; push/deploy ONLY on explicit user instruction.
- Be honest about what can't be verified (no screenshots, no clicking); report blockers plainly.

## 11. PASTE THIS INTO THE NEW CONVERSATION
---
I'm continuing work on the **Shikshaa Sewa Charitable Trust NGO website** (Next.js 14 + TypeScript + Tailwind, repo at `C:\Users\Adi\OneDrive\paaji`, GitHub `mauryakirti2308-ctrl/NGO` branch `main`, live at `https://shikshasewa.vercel.app/`).

**Done:** full public site (magazine homepage, About with approved content, 5 published initiatives, gallery with 13 real photos + lightbox, volunteer/contact/supply/event forms), donations 503-locked with manual-verify flow ready, role-based admin (login/reset, inbox with search/CSV/notes, donations queue, gallery+video managers, settings, audit, launch checklist), email outbox (Resend→SMTP, bounded retries, honest failures), Supabase adapter (JSON fallback; migrations 001–005), branding (blue/orange, logo.jpg, Instagram links), Lighthouse fixes committed.

**Current state:** local HEAD has everything through Lighthouse fixes; last push may predate them. Vercel auto-deploy broke after the repo transferred accounts — user is re-importing the project; deployment status unknown. `PROJECT_CONTEXT.md` in the repo root is the source of truth, but **inspect actual project files (`git log`, `git status`, key routes) before acting**, as state may have moved.

**Immediate next action:** confirm what Vercel shows (new deployment Ready/failed/absent) and verify the live site, or finish the Vercel import with the env list in context. Requirements that never change: no invented NGO facts, drafts stay private, reduced-motion respected, push/deploy only on my explicit word, be honest about anything unverifiable.
---
