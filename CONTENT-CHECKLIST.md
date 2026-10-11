# Client-content checklist — private (repo only, never published on the site)

Working display name (client-supplied): **"Shikshaa Sewa Charitable Trust"**,
slogan "Learn today, lead tomorrow". Legal registration details are still
unpublished pending the exact registered information — do not guess.

## Identity & contact
- [ ] Public display name + registered legal name (`Admin > Settings`, then About/Transparency update automatically)
- [ ] Logo file to replace the "P" monogram
- [ ] Service areas (specific localities)
- [ ] Contact email, phone, WhatsApp number, address, hours, map link (hidden from the site until set)
- [ ] Registration numbers, 12A/80G status (if any), trustees, auditor details
- [ ] Team members, founder message, milestones (all unpublished until approved)

## Programmes, impact, stories
- [ ] Genuine programme list with need, activities, location, photos (do not assume the sample trio exists)
- [ ] Verified impact figures + reporting period + what each figure measures
- [ ] Activity stories with dates, photos, approved outcomes
- [ ] Genuine testimonials with consent
- [ ] Annual/activity reports and approved financial summaries (upload in Admin > Reports data)

## Events, roles, supplies
- [ ] Real events with confirmed dates/venues (unconfirmed stay in draft)
- [ ] Volunteer roles with location, commitment, responsibilities
- [ ] Current supply needs with quantities, condition rules, drop-off details, pickup availability

## Campaigns & donations (keep OFF until ready)
- [ ] Bank account active + verified UPI ID, account holder, bank, number, IFSC, client QR
- [ ] Approved campaign goals, budgets, deadlines
- [ ] Rules for recording verified offline contributions
- [ ] Razorpay decision + integration (server-side orders/signatures/webhooks when built)
- [ ] Tax wording approved (never promise deductions)

## Legal & language
- [ ] Privacy, terms and donation/refund pages reviewed by the client/counsel
- [ ] Approved Hindi translations before any language switch

## Photography (gallery live with 13 client photos)
- [x] 13 client photos published with factual alt text, no captions invented
- [x] Client logo live as `public/logo.jpg` (cropped, 39KB) + `app/icon.png` favicon from its symbol
- [ ] Individual video/reel URLs + uploaded cover images (`data/videos.json` is empty, section hidden)
- [ ] Consent records for every recognisable person
- [ ] Replace/extend with programme, hero and event photos as approved
- [ ] Phone numbers visible on some banners/signage in photos — confirm all may publish

## Integrations
- [ ] Supabase (migrations `001`–`005` in `supabase/migrations/`) for persistent data
- [ ] Resend: `RESEND_API_KEY` + verified sender domain for `EMAIL_FROM` (SMTP_* fallback only)
- [ ] Staff notification recipient: `ADMIN_NOTIFICATION_EMAIL` env or Settings > adminNotificationEmail
- [ ] `APP_URL` (= canonical live URL, used for admin links in emails)
- [ ] `CRON_SECRET` for the `/api/cron/outbox` retry scheduler
- [ ] `NEXT_PUBLIC_SITE_URL` + strong `ADMIN_*` / `SESSION_SECRET` for production
