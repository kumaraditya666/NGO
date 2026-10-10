"use client";
import { useEffect, useState } from "react";
import { Shell, useMe } from "@/components/admin";
export default function SettingsAdmin() {
  const { me, loading } = useMe();
  const [s, setS] = useState<any>({});
  const [msg, setMsg] = useState("");
  useEffect(() => { fetch("/api/admin/settings").then(async (r) => { const j = await r.json(); if (r.ok) setS(j.settings); else setMsg(j.error); }); }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("Change payment/contact details? This is audited and visible to donors.")) return;
    const r = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
    setMsg(r.ok ? "Saved + audited." : (await r.json()).error);
  }
  if (loading) return <p className="p-8">Loading…</p>;
  return (
    <Shell me={me} title="Settings + payment details (admin only)">
      <p className="text-sm text-forest-muted">QR images must come from the client — never reuse the reference site's QR. Changes are audit-logged.</p>
      <form onSubmit={save} className="mt-3 rounded-2xl border bg-white p-5 grid gap-3 max-w-2xl">
        {Object.keys(s).map((k) => (
          <label key={k} className="grid gap-1 text-sm"><span className="font-medium">{k}</span><input className="border rounded-xl px-3 py-2" value={String(s[k] ?? "")} onChange={(e) => setS({ ...s, [k]: k === "pickupEnabled" ? e.target.value === "true" : e.target.value })} /></label>
        ))}
        <button className="rounded-full bg-terracotta text-white px-5 py-2 text-sm font-semibold">Save settings</button>
        {msg && <p className="text-sm">{msg}</p>}
      </form>
    </Shell>
  );
}
