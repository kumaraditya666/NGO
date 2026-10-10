"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell, useMe } from "@/components/admin";

export default function Dashboard() {
  const { me, loading } = useMe();
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any>({ volunteers: [], enquiries: [], pledges: [] });
  useEffect(() => {
    (async () => {
      try {
        const [d, v, e, p, g] = await Promise.all([
          fetch("/api/admin/donations").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/admin/inbox?kind=volunteers").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/admin/inbox?kind=enquiries").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/admin/inbox?kind=inkind_pledges").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/admin/collections?name=gallery").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/admin/collections?name=videos").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ]);
        // videos fetch above may fail for roles without access; fetch separately
        let videos: any[] = [];
        try {
          const rv = await fetch("/api/admin/collections?name=videos");
          if (rv.ok) videos = (await rv.json()).data || [];
        } catch { /* ignore */ }
        const donations = d?.donations || [];
        const vols = v?.data || [];
        const enqs = e?.data || [];
        const pledges = p?.data || [];
        const gal = Array.isArray(g?.data) ? g.data : [];
        const byNew = (a: any[]) => [...a].sort((x, y) => String(y.createdAt || "").localeCompare(String(x.createdAt || "")));
        setStats({
          newVols: vols.filter((x: any) => (x.status || "new") === "new").length,
          vols: vols.length,
          newEnqs: enqs.filter((x: any) => (x.status || "new") === "new").length,
          newPledges: pledges.filter((x: any) => (x.status || "new") === "new").length,
          confirmed: donations.filter((x: any) => x.status === "confirmed" && !x.testRecord).reduce((s: number, x: any) => s + (x.verifiedAmount ?? x.amount), 0),
          pendingDon: donations.filter((x: any) => x.status === "submitted_for_verification").length,
          galPub: gal.filter((x: any) => x.published !== false).length,
          vidPub: videos.filter((x: any) => x.published === true).length,
        });
        setRecent({
          volunteers: byNew(vols).slice(0, 3),
          enquiries: byNew(enqs).slice(0, 3),
          pledges: byNew(pledges).slice(0, 3),
        });
      } catch { /* show empty state below */ }
    })();
  }, []);
  if (loading) return <p className="p-8">Loading…</p>;
  const cards = stats
    ? [
        { t: "New volunteer applications", v: stats.newVols, sub: `${stats.vols} total`, href: "/admin/dashboard/inbox" },
        { t: "New contact enquiries", v: stats.newEnqs, sub: "Needs a reply", href: "/admin/dashboard/inbox" },
        { t: "New supply pledges", v: stats.newPledges, sub: "Awaiting review", href: "/admin/dashboard/inbox" },
        { t: "Donations confirmed", v: `₹${Number(stats.confirmed || 0).toLocaleString("en-IN")}`, sub: `${stats.pendingDon} awaiting verification`, href: "/admin/dashboard/donations" },
        { t: "Published gallery photos", v: stats.galPub, sub: "Live on the site", href: "/admin/dashboard/gallery" },
        { t: "Published videos", v: stats.vidPub, sub: "Live in Stories", href: "/admin/dashboard/content" },
      ]
    : [];
  return (
    <Shell me={me} title="Overview">
      {!stats ? (
        <p className="rounded-2xl border bg-white p-5 text-sm">Could not load statistics — your role may not include every section. Open each section directly from the menu above.</p>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            {cards.map((c) => (
              <Link key={c.t} href={c.href} className="rounded-2xl border bg-white p-5 hover:shadow-panel transition block">
                <p className="text-xs uppercase tracking-widest text-terracotta">{c.t}</p>
                <p className="font-editorial text-3xl mt-1">{c.v}</p>
                <p className="text-xs text-forest-muted">{c.sub}</p>
              </Link>
            ))}
          </div>
          <h2 className="font-editorial text-2xl mt-8">Latest submissions</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {(
              [
                ["Volunteers", recent.volunteers],
                ["Enquiries", recent.enquiries],
                ["Pledges", recent.pledges],
              ] as [string, any[]][]
            ).map(([t, rows]) => (
              <div key={t} className="rounded-2xl border bg-white p-4 text-sm">
                <p className="font-semibold">{t}</p>
                {rows.length === 0 ? (
                  <p className="text-forest-muted mt-1">Nothing yet.</p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {rows.map((r: any) => (
                      <li key={r.id}>
                        <Link href="/admin/dashboard/inbox" className="underline">
                          {r.name || r.email || r.id}
                        </Link>{" "}
                        <span className="text-forest-muted">· {r.status || "new"}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      <p className="mt-4 text-sm text-forest-muted">Roles: administrator (settings + staff), editor (content), reviewer (donations + inbox). Server-enforced on every API — UI links alone grant nothing.</p>
    </Shell>
  );
}
