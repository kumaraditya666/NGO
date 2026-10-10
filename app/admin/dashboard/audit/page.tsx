"use client";
import { useEffect, useState } from "react";
import { Shell, useMe } from "@/components/admin";
export default function Audit() {
  const { me, loading } = useMe();
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetch("/api/admin/audit").then(async (r) => { const j = await r.json(); if (r.ok) setRows(j.audit); }); }, []);
  if (loading) return <p className="p-8">Loading…</p>;
  return (
    <Shell me={me} title="Audit history">
      <div className="space-y-2 text-sm">{rows.map((a) => <div key={a.id} className="rounded-xl border bg-white p-3"><p><strong>{a.action}</strong> · {a.entity}/{a.entityId} · by {a.by} · {a.at}</p><p className="text-forest-muted">{a.detail}</p></div>)}{rows.length === 0 && <p>No audit entries yet.</p>}</div>
    </Shell>
  );
}
