"use client";
import { useEffect, useState } from "react";
import { Shell, useMe } from "@/components/admin";
export default function Dashboard() {
  const { me, loading } = useMe();
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    fetch("/api/admin/donations").then(async (r) => {
      if (!r.ok) return;
      const j = await r.json();
      const confirmed = j.donations.filter((d: any) => d.status === "confirmed").reduce((s: number, d: any) => s + (d.verifiedAmount ?? d.amount), 0);
      const pending = j.donations.filter((d: any) => d.status === "submitted_for_verification").length;
      setStats({ confirmed, pending, total: j.count });
    }).catch(() => {});
  }, []);
  if (loading) return <p className="p-8">Loading…</p>;
  return (
    <Shell me={me} title="Overview">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-forest text-ivory p-5"><p className="text-xs uppercase tracking-widest text-gold">Confirmed (counts only)</p><p className="font-editorial text-3xl mt-1">₹{Number(stats?.confirmed || 0).toLocaleString("en-IN")}</p><p className="text-xs text-ivory/60">Pending gifts excluded.</p></div>
        <div className="rounded-2xl bg-white border p-5"><p className="text-xs uppercase tracking-widest text-terracotta">Awaiting review</p><p className="font-editorial text-3xl mt-1">{stats?.pending ?? "—"}</p><p className="text-xs text-forest-muted">Review queue → Donations.</p></div>
        <div className="rounded-2xl bg-white border p-5"><p className="text-xs uppercase tracking-widest">Total records</p><p className="font-editorial text-3xl mt-1">{stats?.total ?? "—"}</p><p className="text-xs text-forest-muted">Includes rejected/cancelled (never counted).</p></div>
      </div>
      <p className="mt-4 text-sm text-forest-muted">Roles: administrator (settings + staff), editor (content), reviewer (donations + inbox). Server-enforced on every API — UI links alone grant nothing.</p>
    </Shell>
  );
}
