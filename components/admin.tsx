"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function useMe() {
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    fetch("/api/auth/me").then(async (r) => {
      const j = await r.json();
      if (!j.user) router.replace("/admin");
      else setMe(j.user);
      setLoading(false);
    });
  }, [router]);
  return { me, loading };
}

export function Shell({ me, title, children }: any) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs uppercase tracking-widest text-terracotta">Admin · {me?.role}</p><h1 className="font-editorial text-3xl">{title}</h1></div>
        <div className="flex gap-2 text-sm">
          <button className="rounded-full border px-4 py-1.5" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/admin"; }}>Sign out</button>
          <Link href="/" className="rounded-full border px-4 py-1.5">View site</Link>
        </div>
      </div>
      <nav className="mt-4 flex flex-wrap gap-2 text-sm">
        {[["overview", "/admin/dashboard"], ["volunteers", "/admin/dashboard/inbox?kind=volunteers"], ["enquiries", "/admin/dashboard/inbox?kind=enquiries"], ["supplies", "/admin/dashboard/inbox?kind=inkind_pledges"], ["donations", "/admin/dashboard/donations"], ["gallery", "/admin/dashboard/gallery"], ["videos", "/admin/dashboard/videos"], ["notifications", "/admin/dashboard/notifications"], ["content", "/admin/dashboard/content"], ["settings", "/admin/dashboard/settings"], ["staff", "/admin/dashboard/staff"], ["audit", "/admin/dashboard/audit"], ["checklist", "/admin/dashboard/checklist"]].map(([l, h]) => (
          <Link key={h} href={h} className="rounded-full border bg-white px-4 py-1.5 hover:bg-forest hover:text-white">{l}</Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
