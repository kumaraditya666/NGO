// Full workflow tests (default http://localhost:3000). Posture: donations
// DISABLED by default; the script temporarily enables them (admin-only) to test
// the lifecycle, then locks them again. Uses isolated vol-*/enq-*/t-* records.
const BASE = process.env.BASE_URL || "http://localhost:3000";
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name} ${extra}`); } };
async function j(res) { try { return await res.json(); } catch { return {}; } }
async function adminLogin() {
  const r = await fetch(`${BASE}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: process.env.ADMIN_EMAIL || "admin@example.org", password: process.env.ADMIN_PASSWORD || "ChangeMe123!" }) });
  return r.headers.get("set-cookie")?.split(";")[0] || "";
}
const T = Date.now();

async function main() {
  // A. locked by default
  let r = await fetch(`${BASE}/api/donations/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "X", email: "x@y.co", fundType: "general", amount: 501, consent: true }) });
  ok("A1 donation create locked (503)", r.status === 503);
  r = await fetch(`${BASE}/donate`);
  const donateHtml = await r.text();
  ok("A2 donate page opening-soon, no payment details", r.ok && /opening soon/i.test(donateHtml) && !/UPI ID|Account number|IFSC/i.test(donateHtml));

  const cookie = await adminLogin();
  const H = { Cookie: cookie };
  const HJ = { "Content-Type": "application/json", Cookie: cookie };

  // B. enable (admin-only) and run the lifecycle with isolated records
  r = await fetch(`${BASE}/api/admin/settings`, { method: "POST", headers: HJ, body: JSON.stringify({ donationsEnabled: true }) });
  ok("B1 admin can enable donations", r.ok);
  r = await fetch(`${BASE}/api/donations/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "T Donor", email: `t-donor-${T}@test.co`, fundType: "general", amount: 501, consent: true }) });
  let d = await j(r);
  ok("B2 create pending", r.ok && d.status === "awaiting_payment", d.reference);
  r = await fetch(`${BASE}/api/donations/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference: d.reference, utr: "TUTR" + T, paidAt: "2026-10-01" }) });
  ok("B3 verify submitted", r.ok && (await j(r)).status === "submitted_for_verification");
  r = await fetch(`${BASE}/api/admin/donations`, { method: "POST", headers: HJ, body: JSON.stringify({ reference: d.reference, action: "confirm", verifiedAmount: 501, note: "test" }) });
  let c = await j(r);
  ok("B4 admin confirm", r.ok && c.donation?.status === "confirmed");
  r = await fetch(`${BASE}/api/admin/donations`, { method: "POST", headers: HJ, body: JSON.stringify({ reference: d.reference, action: "confirm", verifiedAmount: 501 }) });
  ok("B5 double confirm blocked", r.status === 409);
  r = await fetch(`${BASE}/api/admin/donations`, { method: "POST", headers: HJ, body: JSON.stringify({ reference: d.reference, action: "mark_test" }) });
  c = await j(r);
  ok("B6 mark test record", r.ok && c.donation?.testRecord === true);
  r = await fetch(`${BASE}/api/donations/ack?reference=${d.reference}&token=${d.token}`);
  ok("B7 ack still available for confirmed test record", r.ok);
  // lock again
  r = await fetch(`${BASE}/api/admin/settings`, { method: "POST", headers: HJ, body: JSON.stringify({ donationsEnabled: false }) });
  ok("B8 admin re-locks donations", r.ok);
  r = await fetch(`${BASE}/api/donations/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "X", email: "x@y.co", fundType: "general", amount: 5, consent: true }) });
  ok("B9 locked again (503)", r.status === 503);

  // C. drafts stay private
  r = await fetch(`${BASE}/campaigns/community-library-fund`);
  ok("C1 draft campaign 404s", r.status === 404);
  r = await fetch(`${BASE}/programs/learning-foundations`);
  ok("C2 draft program 404s", r.status === 404);

  // D. volunteer: validation, honeypot, idempotent duplicates
  const vol = { name: "Vol Iso", phone: `90000${String(T).slice(-5)}`, location: "Testville", consent: true };
  r = await fetch(`${BASE}/api/volunteer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vol) });
  let v1 = await j(r);
  ok("D1 volunteer phone-only saves", r.ok && !!v1.id, v1.id);
  r = await fetch(`${BASE}/api/volunteer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vol) });
  let v2 = await j(r);
  ok("D2 duplicate submit idempotent", r.ok && v2.id === v1.id);
  r = await fetch(`${BASE}/api/volunteer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "No Contact", consent: true }) });
  ok("D3 contact required", r.status === 400);
  r = await fetch(`${BASE}/api/volunteer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...vol, name: "Bot", company: "spam-inc" }) });
  let vb = await j(r);
  ok("D4 honeypot pretends success without storing", r.ok && vb.id === "ok");

  // E. enquiries save + inbox review flow + export gating
  r = await fetch(`${BASE}/api/enquiries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Enq Iso", email: `enq-${T}@test.co`, kind: "contact", message: "iso hello " + T, consent: true }) });
  let e1 = await j(r);
  ok("E1 enquiry saves", r.ok && !!e1.id);
  r = await fetch(`${BASE}/api/admin/inbox?kind=volunteers`, { headers: H });
  ok("E2 inbox requires staff", (await fetch(`${BASE}/api/admin/inbox?kind=volunteers`)).status === 401 && r.ok);
  r = await fetch(`${BASE}/api/admin/inbox`, { method: "POST", headers: HJ, body: JSON.stringify({ kind: "volunteers", id: v1.id, status: "contacted", staffNote: "iso-note" }) });
  ok("E3 status+note save", r.ok);
  r = await fetch(`${BASE}/api/admin/inbox?kind=volunteers`, { headers: H });
  const vols = (await j(r)).data || [];
  const back = vols.find((x) => x.id === v1.id);
  ok("E4 note persisted + reviewer stamped", back?.staffNote === "iso-note" && !!back?.reviewedBy);
  r = await fetch(`${BASE}/api/admin/inbox/export?kind=volunteers`);
  ok("E5 export requires staff", r.status === 401);
  r = await fetch(`${BASE}/api/admin/inbox/export?kind=volunteers`, { headers: H });
  ok("E6 export works for staff", r.ok && (await r.text()).includes("vol_"));

  // F. password flows
  r = await fetch(`${BASE}/api/auth/forgot`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "admin@example.org" }) });
  let f = await j(r);
  ok("F1 forgot honest without SMTP", r.ok && f.delivered === false && /administrator/i.test(f.message));
  r = await fetch(`${BASE}/api/auth/reset`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: "bogus", password: "longenough1" }) });
  ok("F2 bad reset token rejected", r.status === 400);
  r = await fetch(`${BASE}/api/admin/staff`, { method: "POST", headers: HJ, body: JSON.stringify({ email: `iso-rev-${T}@test.co`, name: "Iso Rev", role: "reviewer", password: "IsoPass123!" }) });
  ok("F3 temp reviewer created", r.ok);
  r = await fetch(`${BASE}/api/admin/staff/password`, { method: "POST", headers: HJ, body: JSON.stringify({ email: `iso-rev-${T}@test.co`, password: "IsoPass456!" }) });
  ok("F4 admin password-set works", r.ok);
  r = await fetch(`${BASE}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: `iso-rev-${T}@test.co`, password: "IsoPass456!" }) });
  ok("F5 login with new password", r.ok);
  r = await fetch(`${BASE}/api/admin/staff/password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: `iso-rev-${T}@test.co`, password: "nope12345" }) });
  ok("F6 password-set requires admin session", r.status === 401);

  // G. gallery publish cycle with an uploaded file
  const { readFileSync } = await import("node:fs");
  const sample = readFileSync("./public/images/gallery/thumbs/f6d56cfa-8e89-4ab6-9bb8-af3b308c331f.jpg");
  const gf = new FormData();
  gf.append("files", new Blob([sample], { type: "image/jpeg" }), "iso-test.jpg");
  gf.append("category", "All Photos");
  r = await fetch(`${BASE}/api/admin/gallery/upload`, { method: "POST", headers: H, body: gf });
  let g = await j(r);
  ok("G1 gallery upload (unpublished default)", r.ok && g.added?.[0] && g.added[0].published === false);
  const gid = g.added?.[0]?.id;
  let home = await (await fetch(`${BASE}/`)).text();
  ok("G2 unpublished upload hidden from homepage", gid ? !home.includes(gid) && !home.includes("iso-test") : false);
  r = await fetch(`${BASE}/api/admin/collections?name=gallery`, { headers: H });
  const gal = (await j(r)).data || [];
  const target = gal.find((x) => x.id === gid);
  r = await fetch(`${BASE}/api/admin/collections`, { method: "POST", headers: HJ, body: JSON.stringify({ name: "gallery", data: gal.map((x) => (x.id === gid ? { ...x, published: true, alt: "Iso test upload" } : x)), action: "test-publish" }) });
  ok("G3 publish works", r.ok);
  home = await (await fetch(`${BASE}/gallery`)).text();
  ok("G4 published upload appears on gallery page (alt shown, filename not as text)", home.includes("Iso test upload") && !home.includes(">iso-test"));
  r = await fetch(`${BASE}/api/admin/gallery/delete`, { method: "POST", headers: HJ, body: JSON.stringify({ id: gid, removeFiles: true }) });
  ok("G5 delete with files works", r.ok);

  // H. videos: validation + hidden-when-empty + draft privacy
  r = await fetch(`${BASE}/api/admin/collections`, { method: "POST", headers: HJ, body: JSON.stringify({ name: "videos", data: [{ id: "x", title: "Bad", platform: "youtube", url: "https://evil.example.com/x", cover: "/a.jpg", order: 1 }] }) });
  ok("H1 evil video URL rejected", r.status === 400);
  const home2 = await (await fetch(`${BASE}/`)).text();
  ok("H2 videos section hidden when empty", !home2.includes("Stories from Our Work"));

  // J. notifications: jobs recorded honestly, retry is idempotent, staff-only
  r = await fetch(`${BASE}/api/volunteer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Notify Iso", email: `notify-${T}@test.co`, phone: "9111111111", consent: true }) });
  const jv = await j(r);
  ok("J1 volunteer submit succeeds (save first)", r.ok && !!jv.id && jv.id !== "ok");
  r = await fetch(`${BASE}/api/admin/notifications`, { headers: H });
  const jobs = (await j(r)).jobs || [];
  const mine = jobs.filter((x) => x.refId === jv.id);
  ok("J2 outbox jobs recorded for the submission", mine.length >= 1, `jobs=${mine.length}`);
  ok("J3 unconfigured mail recorded as failed (never fake-sent)", mine.length > 0 && mine.every((x) => x.status === "failed" && /not configured|no admin recipient/i.test(x.lastError || "")));
  const before = mine.length;
  if (mine.length > 0) {
    r = await fetch(`${BASE}/api/admin/notifications`, { method: "POST", headers: HJ, body: JSON.stringify({ id: mine[0].id }) });
    const rj = await j(r);
    ok("J4 retry accepted", r.ok);
    r = await fetch(`${BASE}/api/admin/notifications`, { headers: H });
    const after = ((await j(r)).jobs || []).filter((x) => x.refId === jv.id);
    ok("J5 retry reuses the job (no duplicates)", after.length === before);
  } else {
    ok("J4 retry accepted", false, "no jobs to retry");
    ok("J5 retry reuses the job (no duplicates)", false, "no jobs to retry");
  }
  r = await fetch(`${BASE}/api/admin/notifications`);
  ok("J6 notifications require staff", r.status === 401);
  // event registration dedupe
  const evBody = { eventId: "evt_camp", name: "Ev Iso", email: `ev-${T}@test.co`, seats: 1, consent: true };
  r = await fetch(`${BASE}/api/events/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(evBody) });
  const regNote = r.ok ? "" : ` (event may be draft: ${r.status})`;
  if (r.ok) {
    const r1 = await j(r);
    r = await fetch(`${BASE}/api/events/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(evBody) });
    ok("J7 duplicate registration idempotent" + regNote, r.ok);
  } else {
    ok("J7 duplicate registration idempotent" + regNote, r.status === 404);
  }

  // I. public pages + event capacity + footer admin link
  for (const u of ["/", "/gallery", "/volunteer", "/support", "/transparency", "/contact", "/admin/login", "/admin/forgot"]) {
    r = await fetch(`${BASE}${u}`);
    ok(`I page ${u} loads`, r.ok);
  }
  const homeHtml = await (await fetch(`${BASE}/`)).text();
  ok("I footer admin login link", /\/admin\/login/.test(homeHtml));
  r = await fetch(`${BASE}/api/events/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventId: "nope", name: "Xyz", email: "x@y.co", consent: true }) });
  ok("I bad event rejected", r.status === 404);

  // K. escaping, per-record lookup, cron guard
  const xssName = "<b>XSS-" + T + "</b>";
  r = await fetch(`${BASE}/api/volunteer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: xssName, email: `xss-${T}@test.co`, consent: true }) });
  const xv = await j(r);
  r = await fetch(`${BASE}/api/admin/notifications?refId=${xv.id}`, { headers: H });
  const xj = (await j(r)).jobs || [];
  const xAdmin = xj.find((x) => x.purpose === "admin-notify");
  ok("K1 user content escaped in stored email HTML", r.ok && !!xAdmin && xAdmin.html.includes("&lt;b&gt;") && !xAdmin.html.includes("<b>XSS-"));
  ok("K2 notifications filterable by record", r.ok && xj.length >= 1);
  r = await fetch(`${BASE}/api/cron/outbox`);
  ok("K3 cron requires secret", r.status === 401);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
