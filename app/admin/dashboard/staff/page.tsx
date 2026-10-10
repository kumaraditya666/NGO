"use client";
import { useEffect, useState } from "react";
import { Shell, useMe } from "@/components/admin";
export default function StaffAdmin() {
  const { me, loading } = useMe();
  const [list, setList] = useState<any[]>([]);
  const [f, setF] = useState({ email: "", name: "", role: "editor", password: "" });
  const [msg, setMsg] = useState("");
  async function load() {
    const r = await fetch("/api/admin/staff");
    const j = await r.json();
    if (r.ok) setList(j.staff);
    else setMsg(j.error);
  }
  useEffect(() => { load(); }, []);
  if (loading) return <p className="p-8">Loading…</p>;
  return (
    <Shell me={me} title="Staff & roles (admin only)">
      <div className="rounded-2xl border bg-white p-4 text-sm">{list.map((s) => <p key={s.id}>{s.name} · {s.email} · <strong>{s.role}</strong></p>)}</div>
      <form onSubmit={async (e) => { e.preventDefault(); const r = await fetch("/api/admin/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) }); setMsg(r.ok ? "Created" : (await r.json()).error); load(); }} className="mt-3 rounded-2xl border bg-white p-4 grid gap-2 max-w-md text-sm">
        <input required placeholder="email" className="border rounded px-3 py-2" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input placeholder="name" className="border rounded px-3 py-2" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <select className="border rounded px-3 py-2" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}><option value="administrator">administrator</option><option value="editor">editor</option><option value="reviewer">reviewer</option></select>
        <input required type="password" placeholder="password" className="border rounded px-3 py-2" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <button className="rounded-full bg-forest text-white px-4 py-2">Add staff</button>
        {msg && <p>{msg}</p>}
      </form>
    </Shell>
  );
}
