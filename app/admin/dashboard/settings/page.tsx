"use client";
import { useEffect, useState } from "react";
import { Shell, useMe } from "@/components/admin";

const BOOLS = ["donationsEnabled", "pickupEnabled"];
const BOOL_HELP: Record<string, string> = {
  donationsEnabled: "Master switch. OFF = no payment initiation or reference submission anywhere (server-enforced, 503). Turn on only after the bank account is active and verified details are published.",
  pickupEnabled: "Offer supply pickup in some areas. OFF = drop-off only.",
};

export default function SettingsAdmin() {
  const { me, loading } = useMe();
  const [s, setS] = useState<any>({});
  const [msg, setMsg] = useState("");
  useEffect(() => {
    fetch("/api/admin/settings").then(async (r) => {
      const j = await r.json();
      if (r.ok) setS(j.settings);
      else setMsg(j.error);
    });
  }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("Save settings? Payment and identity changes are audited.")) return;
    const r = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
    setMsg(r.ok ? "Saved + audited." : (await r.json()).error);
  }
  if (loading) return <p className="p-8">Loading…</p>;
  const strings = Object.keys(s).filter((k) => !BOOLS.includes(k));
  return (
    <Shell me={me} title="Settings (admin only)">
      <p className="text-sm text-forest-muted max-w-2xl">
        Display name and legal name are separate fields — the working title stays until the
        client confirms the registered legal name. Payment details stay empty until verified.
      </p>
      <form onSubmit={save} className="mt-3 rounded-2xl border bg-white p-5 grid gap-4 max-w-2xl">
        {BOOLS.filter((k) => k in s).map((k) => (
          <label key={k} className="flex gap-3 items-start rounded-xl bg-parchment border border-forest/10 p-4 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={s[k] === true}
              onChange={(e) => setS({ ...s, [k]: e.target.checked })}
              className="mt-1 h-4 w-4"
            />
            <span><strong>{k}</strong> — currently <strong>{s[k] === true ? "ON" : "OFF"}</strong><br />
            <span className="text-forest-muted">{BOOL_HELP[k]}</span></span>
          </label>
        ))}
        {strings.map((k) => (
          <label key={k} className="grid gap-1 text-sm">
            <span className="font-medium">{k}</span>
            <input
              className="border rounded-xl px-3 py-2"
              value={String(s[k] ?? "")}
              onChange={(e) => setS({ ...s, [k]: e.target.value })}
              placeholder={k === "legalName" ? "Empty until confirmed" : ""}
            />
          </label>
        ))}
        <button className="rounded-full bg-terracotta text-white px-5 py-2 text-sm font-semibold">Save settings</button>
        {msg && <p className="text-sm" role="status">{msg}</p>}
      </form>
    </Shell>
  );
}
