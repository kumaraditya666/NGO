"use client";
import { useEffect, useState } from "react";
import { Shell, useMe } from "@/components/admin";
const KINDS = ["volunteers", "enquiries", "inkind_pledges", "registrations"];
export default function Inbox() {
  const { me, loading } = useMe();
  const [kind, setKind] = useState("volunteers");
  const [data, setData] = useState<any[]>([]);
  async function load(k = kind) {
    const r = await fetch(`/api/admin/inbox?kind=${k}`);
    const j = await r.json();
    if (r.ok) setData(j.data);
  }
  useEffect(() => { load(); }, []);
  if (loading) return <p className="p-8">Loading…</p>;
  return (
    <Shell me={me} title="Inbox — volunteers, events, pledges, enquiries">
      <div className="flex gap-2">{KINDS.map((k) => <button key={k} onClick={() => { setKind(k); load(k); }} className={`rounded-full border px-4 py-1.5 text-sm ${kind === k ? "bg-forest text-white" : "bg-white"}`}>{k}</button>)}</div>
      <div className="mt-4 space-y-2">{data.map((d) => (
        <div key={d.id} className="rounded-2xl border bg-white p-4 text-sm">
          <p><strong>{d.name}</strong> · {d.email} · {d.status || "new"} · {d.createdAt}</p>
          <p className="text-forest-muted">{d.message || d.skills || d.subject || JSON.stringify(d).slice(0, 160)}</p>
          <div className="mt-1 flex gap-2">{["reviewing", "accepted", "declined", "done"].map((s) => <button key={s} className="rounded-full border px-3 py-0.5 text-xs" onClick={async () => { await fetch("/api/admin/inbox", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, id: d.id, status: s }) }); load(); }}>{s}</button>)}</div>
        </div>
      ))}{data.length === 0 && <p className="text-sm">Empty.</p>}</div>
    </Shell>
  );
}
