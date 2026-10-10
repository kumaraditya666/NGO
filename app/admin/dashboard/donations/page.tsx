"use client";
import { useEffect, useState } from "react";
import { Shell, useMe } from "@/components/admin";
export default function DonationsAdmin() {
  const { me, loading } = useMe();
  const [list, setList] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [msg, setMsg] = useState("");
  const [note, setNote] = useState<{ [k: string]: string }>({});
  const [amt, setAmt] = useState<{ [k: string]: string }>({});
  async function load() {
    const r = await fetch(`/api/admin/donations?status=${status}&q=${encodeURIComponent(q)}`);
    const j = await r.json();
    if (r.ok) setList(j.donations);
    else setMsg(j.error || "Forbidden for your role");
  }
  useEffect(() => { load(); }, []);
  async function act(ref: string, action: string) {
    setMsg("Working…");
    const r = await fetch("/api/admin/donations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference: ref, action, verifiedAmount: Number(amt[ref]), note: note[ref] || "" }) });
    const j = await r.json();
    if (!r.ok) setMsg(j.error);
    else { setMsg(`${action} done for ${ref}`); load(); }
  }
  if (loading) return <p className="p-8">Loading…</p>;
  return (
    <Shell me={me} title="Donation review queue">
      <div className="flex flex-wrap gap-2 text-sm">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="search ref / name / UTR" className="border rounded-full px-4 py-1.5" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-full px-3 py-1.5"><option value="">All</option><option value="awaiting_payment">awaiting_payment</option><option value="submitted_for_verification">submitted</option><option value="confirmed">confirmed</option><option value="rejected">rejected</option></select>
        <button onClick={load} className="rounded-full bg-forest text-white px-4 py-1.5">Filter</button>
        <a href="/api/admin/export" className="rounded-full border px-4 py-1.5">Export CSV (staff only)</a>
      </div>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
      <div className="mt-4 space-y-3">
        {list.map((d) => (
          <div key={d.reference} className="rounded-2xl border bg-white p-4 text-sm">
            <p><strong>{d.reference}</strong> · {d.status} · ₹{d.amount} {d.verifiedAmount ? `(verified ₹${d.verifiedAmount})` : ""} {d.testRecord ? <span className="font-semibold">· TEST RECORD (excluded from totals)</span> : ""} {d.duplicateUtr ? <span className="text-terracotta font-semibold">· possible duplicate UTR — check</span> : ""}</p>
            <p className="text-forest-muted">{d.name} · {d.email} · {d.phone} · {d.fundType}/{d.fundId} · UTR {d.utr || "—"} · paid {d.paidAt || "—"} {d.cannotFindRef ? "· cannot-find-ref path" : ""}</p>
            {d.proofFile && <p><a className="underline text-terracotta" target="_blank" href={`/api/admin/proofs?file=${d.proofFile}`}>View proof (staff only)</a></p>}
            <div className="mt-2 flex flex-wrap gap-2">
              <input placeholder="verified amount" className="border rounded px-2 py-1 w-36" value={amt[d.reference] || ""} onChange={(e) => setAmt({ ...amt, [d.reference]: e.target.value })} />
              <input placeholder="internal note" className="border rounded px-2 py-1 flex-1 min-w-[180px]" value={note[d.reference] || ""} onChange={(e) => setNote({ ...note, [d.reference]: e.target.value })} />
              <button onClick={() => { if (confirm(`Confirm ${d.reference} after matching bank credit?`)) act(d.reference, "confirm"); }} className="rounded-full bg-forest text-white px-4 py-1">Confirm</button>
              <button onClick={() => { if (confirm(`Reject ${d.reference}?`)) act(d.reference, "reject"); }} className="rounded-full border px-4 py-1">Reject</button>
              <button onClick={() => act(d.reference, d.testRecord ? "unmark_test" : "mark_test")} className="rounded-full border px-4 py-1" title="Test records never count toward public totals">{d.testRecord ? "Unmark test" : "Mark test"}</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-forest-muted">No donations match. Submit one via /donate to test.</p>}
      </div>
    </Shell>
  );
}
