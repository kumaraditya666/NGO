# Content checklist — missing client information (developer only, never public)

The homepage is written to read cleanly with zero placeholder labels, but the
items below are still **working assumptions or illustrative stand-ins** and are
launch blockers until the client supplies the real thing.

## Identity & contact (blockers)
- [ ] Registered NGO name. Working title currently shown: **"Paaji"** (taken from
      the repo folder name — confirm or replace everywhere: header, footer,
      homepage copy, `NEXT_PUBLIC_SITE_NAME`, page metadata).
- [ ] Logo file (SVG preferred) to replace the "P" monogram in the header.
- [ ] Areas served (specific localities — homepage currently says only "India").
- [ ] Contact details: real address, working hours, email, phone, WhatsApp number,
      map link (footer/contact still show `hello@example.org`, `+91-00000-00000`).
- [ ] Registration numbers, 12A/80G status (if any), trustees, auditor details.

## Photography & artwork — homepage now uses licensed stock (prototype)
- Homepage photos are **stock from Wikimedia Commons**, downloaded to
  `public/photos/`, with source + licence recorded in `ASSET-MANIFEST.md` and a
  discreet "Illustrative photography" note on-page. They are not Paaji's own work.
- [ ] Replace ALL stock files with client-owned photographs (with recorded
      subject consent), then retire the manifest's stock entries.
- [ ] 1 strong community photo for the hero (landscape, faces visible, space for text).
- [ ] 3 program photos (learning, health, livelihoods/environment).
- [ ] Client-owned UPI QR image (never reuse any QR from the reference site).
- [ ] Consent forms on file for every recognisable person in every photo.

## Gallery — client photos (add files, then sync)
How to publish: drop originals into `public/images/gallery/` (subfolders become
categories, e.g. `Events/`), then run `powershell -ExecutionPolicy Bypass -File
scripts/sync-gallery.ps1`. The script creates EXIF-free `thumbs/` + `large/`
derivatives (originals untouched), rebuilds `data/gallery.json` preserving any
captions/alts/order set in Admin, and warns about GPS metadata in originals.
- [x] 13 client gallery photos live (`public/images/gallery/`, one "All Photos"
      collection, no subfolders supplied). Alt text written from visible content.
- [ ] Captions only where the client provides them (none shown currently).
- [ ] Confirm brand: client photos show "Shikshaa Sewa Charitable Trust" — confirm
      whether the site should be rebranded from the "Paaji" working title.
- [ ] Raw originals may carry EXIF in future uploads; run the sync script (warns
      on GPS) and keep originals out of `public/` if they must stay private.

## Figures, stories & endorsements (do NOT invent)
- [ ] Verified impact figures + reporting period (homepage shows process facts only).
- [ ] One approved impact story with written consent (homepage deliberately shows none).
- [ ] Genuine testimonials with consent (homepage deliberately shows none).
- [ ] Partner/media logos only with written permission (none shown).
- [ ] Program names: data titles still carry "(sample)" suffixes, stripped at render
      on the homepage only — confirm final names in `data/programs.json`.
- [ ] Campaign goals, budgets, deadlines and offline-verified amounts (homepage
      omits campaign figures entirely until approved).
- [ ] Tax-deduction wording approved by the client/CA (site promises none).

## Configuration
- [ ] Verified UPI ID + bank details entered in Admin → Settings (currently samples).
- [ ] SMTP credentials for real email; Hindi translations before any language switch.

## Deliberately omitted from the homepage (no approved material)
- Image carousel (needs multiple approved photos + captions).
- Impact metrics strip, impact story, testimonials, partner logos.
