# Client-content checklist — private (repo only, never published on the site)

Working title on the site: **"Paaji"**. Client photographs show **"Shikshaa Sewa
Charitable Trust"** — confirm the public display name and the registered legal
name before changing anything. Do not guess.

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
- [ ] Consent records for every recognisable person
- [ ] Replace/extend with programme, hero and event photos as approved
- [ ] Phone numbers visible on some banners/signage in photos — confirm all may publish

## Integrations
- [ ] Supabase (migrations in `supabase/migrations/`) for persistent data
- [ ] SMTP for real acknowledgement emails (forms save + log until then)
- [ ] `NEXT_PUBLIC_SITE_URL` + strong `ADMIN_*` / `SESSION_SECRET` for production
