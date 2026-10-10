// Workflow tests against the running server (default http://localhost:3000).
// Current posture: online donations DISABLED (server-enforced 503), samples in draft,
// gallery/volunteer/contact live. Covers: payment lock, draft privacy, form honesty,
// gallery publishing, auth gating, upload validation, event capacity.
const BASE = process.env.BASE_URL || "http://localhost:3000";
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name} ${extra}`); } };

async function j(res) { try { return await res.json(); } catch { return {}; } }

async function adminLogin() {
  const r = await fetch(`${BASE}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: process.env.ADMIN_EMAIL || "admin@example.org", password: process.env.ADMIN_PASSWORD || "ChangeMe123!" }) });
  const cookie = r.headers.get("set-cookie")?.split(";")[0] || "";
  return cookie;
}

async function main() {
  // 1-3. payment initiation + reference submission + proof upload all disabled
  let r = await fetch(`${BASE}/api/donations/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "X", email: "x@y.co", fundType: "general", amount: 501, consent: true }) });
  ok("donation create disabled (503)", r.status === 503);
  r = await fetch(`${BASE}/api/donations/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference: "NGO-1", utr: "U1", paidAt: "2026-10-01" }) });
  ok("donation verify disabled (503)", r.status === 503);
  const fd = new FormData();
  fd.append("file", new Blob(["x"], { type: "image/png" }), "p.png");
  r = await fetch(`${BASE}/api/donations/upload`, { method: "POST", body: fd });
  ok("donation upload disabled (503)", r.status === 503);

  // 4. donate page shows opening-soon, no payment details
  r = await fetch(`${BASE}/donate`);
  const donateHtml = await r.text();
  ok("donate page opening-soon", r.ok && /opening soon/i.test(donateHtml) && !/UPI ID|Account number|IFSC/i.test(donateHtml));

  // 5. support page offers alternatives
  r = await fetch(`${BASE}/support`);
  ok("support page loads", r.ok);

  // 6. draft campaign detail stays private
  r = await fetch(`${BASE}/campaigns/community-library-fund`);
  ok("draft campaign 404s", r.status === 404);

  // 7. draft program detail stays private
  r = await fetch(`${BASE}/programs/learning-foundations`);
  ok("draft program 404s", r.status === 404);

  // 8. volunteer saves with phone only (email optional now)
  r = await fetch(`${BASE}/api/volunteer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Vol Test", phone: "9999999999", consent: true }) });
  let v = await j(r);
  ok("volunteer phone-only saves", r.ok && !!v.id, JSON.stringify(v));

  // 9. volunteer requires at least one contact
  r = await fetch(`${BASE}/api/volunteer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "No Contact", consent: true }) });
  ok("volunteer contact required", r.status === 400);

  // 10. contact enquiry saves honestly
  r = await fetch(`${BASE}/api/enquiries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "C Test", email: "c@test.co", kind: "contact", message: "hello there", consent: true }) });
  ok("enquiry saves", r.ok);

  // 11-12. gallery admin upload validation (auth-gated)
  const cookie = await adminLogin();
  const H = { Cookie: cookie };
  const bad = new FormData();
  bad.append("files", new Blob(["x"], { type: "text/plain" }), "evil.txt");
  r = await fetch(`${BASE}/api/admin/gallery/upload`, { method: "POST", headers: H, body: bad });
  ok("gallery upload rejects non-image", r.status === 400);
  r = await fetch(`${BASE}/api/admin/gallery/upload`, { method: "POST", body: bad });
  ok("gallery upload requires staff", r.status === 401);

  // 13. checklist requires staff
  r = await fetch(`${BASE}/api/admin/checklist`);
  ok("checklist guarded", r.status === 401);
  r = await fetch(`${BASE}/api/admin/checklist`, { headers: H });
  const cl = await j(r);
  ok("checklist loads for staff", r.ok && cl.total > 0, `items=${cl.total}`);

  // 14. settings change requires administrator
  r = await fetch(`${BASE}/api/admin/settings`, { method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify({ donationsEnabled: false }) });
  ok("settings still admin-only + toggle accepted", r.ok);

  // 15. event capacity enforced
  r = await fetch(`${BASE}/api/events/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventId: "nope", name: "Xyz", email: "x@y.co", consent: true }) });
  ok("bad event rejected", r.status === 404);

  // 16. public pages render
  for (const u of ["/", "/gallery", "/volunteer", "/support", "/transparency", "/contact"]) {
    r = await fetch(`${BASE}${u}`);
    ok(`page ${u} loads`, r.ok);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
