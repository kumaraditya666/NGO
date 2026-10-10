"use client";
import { useEffect, useState } from "react";
import { Shell, useMe } from "@/components/admin";
export default function Checklist() {
  const { me, loading } = useMe();
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/admin/checklist").then(async (r) => {
      if (r.ok) setData(await r.json());
    });
  }, []);
  if (loading) return <p className="p-8">Loading…</p>;
  return (
    <Shell me={me} title="Launch readiness (private)">
      <p className="text-sm text-forest-muted max-w-2xl">
        Staff-only. Nothing here is public. Work through the open items with the client —
        unfinished content stays in draft until approved.
      </p>
      {!data ? (
        <p className="mt-4">Loading…</p>
      ) : (
        <>
          <p className="mt-4 font-semibold">
            {data.done} of {data.total} ready
          </p>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {data.groups.map((gr: any) => (
              <div key={gr.title} className="rounded-2xl border bg-white p-4">
                <h2 className="font-semibold">{gr.title}</h2>
                <ul className="mt-2 space-y-2 text-sm">
                  {gr.items.map((i: any) => (
                    <li key={i.label} className="flex gap-2">
                      <span aria-hidden>{i.done ? "✅" : "⬜"}</span>
                      <span>
                        <strong>{i.label}</strong>
                        {i.hint && <span className="block text-forest-muted text-[13px]">{i.hint}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </Shell>
  );
}
