"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Shell, useMe } from "@/components/admin";

const KINDS = [
  { key: "volunteers", label: "Volunteers", statuses: ["new", "contacted", "accepted", "closed"] },
  { key: "enquiries", label: "Enquiries", statuses: ["new", "contacted", "closed"] },
  { key: "inkind_pledges", label: "Supply pledges", statuses: ["new", "contacted", "accepted", "closed"] },
  { key: "registrations", label: "Event registrations", statuses: ["new", "contacted", "closed"] },
];
const PAGE = 10;

const FIELDS: Record<string, [string, string][]> = {
  volunteers: [["name", "Name"], ["email", "Email"], ["phone", "Phone"], ["location", "Area"], ["skills", "Skills"], ["interests", "Interests"], ["availability", "Availability"], ["programId", "Programme"], ["eventId", "Event"], ["message", "Message"]],
  enquiries: [["name", "Name"], ["email", "Email"], ["phone", "Phone"], ["subject", "Subject"], ["message", "Message"]],
  inkind_pledges: [["name", "Name"], ["email", "Email"], ["phone", "Phone"], ["subject", "Pledge"], ["message", "Details"]],
  registrations: [["name", "Name"], ["email", "Email"], ["phone", "Phone"], ["eventId", "Event"], ["seats", "Seats"]],
};

export default function Inbox() {
  return (
    <Suspense>
      <InboxInner />
    </Suspense>
  );
}

function InboxInner() {
  const { me, loading } = useMe();
  const sp = useSearchParams();
  const initial = sp.get("kind") || "volunteers";
  const [kind, setKind] = useState(KINDS.some((k) => k.key === initial) ? initial : "volunteers");
  const [data, setData] = useState<any[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");

  async function load(k = kind) {
    setState("loading");
    try {
      const r = await fetch(`/api/admin/inbox?kind=${k}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to load");
      setData(j.data);
      setState("idle");
    } catch (e: any) {
      setMsg(e.message);
      setState("error");
    }
  }
  useEffect(() => { load(); }, []);
  function switchKind(k: string) {
    setKind(k); setQ(""); setStatus(""); setPage(0); setOpenId(null); load(k);
  }

  const meta = KINDS.find((k) => k.key === kind)!;
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return [...data]
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
      .filter((d) => !status || (d.status || "new") === status)
      .filter((d) => !needle || JSON.stringify(d).toLowerCase().includes(needle));
  }, [data, q, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const rows = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const open = data.find((d) => d.id === openId) || null;

  async function save(id: string, patch: any) {
    setMsg("Saving…");
    const r = await fetch("/api/admin/inbox", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, id, ...patch }) });
    if (!r.ok) setMsg((await r.json()).error || "Save failed");
    else { setMsg("Saved."); load(kind); }
  }

  if (loading) return <p className="p-8">Loading…</p>;
  return (
    <Shell me={me} title="Inbox — applications, enquiries, pledges">
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button key={k.key} onClick={() => switchKind(k.key)} className={`rounded-full border px-4 py-1.5 text-sm ${kind === k.key ? "bg-forest text-white" : "bg-white"}`}>{k.label}</button>
        ))}
        <a href={`/api/admin/inbox/export?kind=${kind}`} className="rounded-full border px-4 py-1.5 text-sm bg-white">Export CSV</a>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search name, email, text…" aria-label="Search submissions" className="border rounded-full px-4 py-1.5 text-sm flex-1 min-w-[200px]" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} aria-label="Filter by status" className="border rounded-full px-3 py-1.5 text-sm bg-white">
          <option value="">All statuses</option>
          {meta.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {msg && <p className="mt-2 text-sm" role="status">{msg}</p>}

      {state === "loading" && <p className="mt-4 text-sm">Loading…</p>}
      {state === "error" && <p className="mt-4 text-sm">Could not load. Your role may not include this section.</p>}
      {state === "idle" && filtered.length === 0 && (
        <p className="mt-4 rounded-2xl border bg-white p-5 text-sm">Nothing here{q || status ? " matching this filter" : " yet"}.</p>
      )}

      {state === "idle" && rows.length > 0 && (
        <>
          <div className="mt-4 hidden md:block overflow-x-auto rounded-2xl border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-3 font-semibold">Name</th>
                  <th className="p-3 font-semibold">Contact</th>
                  <th className="p-3 font-semibold">Summary</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id} className="border-b last:border-0 hover:bg-parchment/50 cursor-pointer" onClick={() => { setOpenId(d.id); setNote(d.staffNote || ""); }}>
                    <td className="p-3 font-medium">{d.name || "—"}</td>
                    <td className="p-3">{[d.email, d.phone].filter(Boolean).join(" · ") || "—"}</td>
                    <td className="p-3 text-forest-muted max-w-[280px] truncate">{d.message || d.subject || d.skills || d.eventId || "—"}</td>
                    <td className="p-3">{d.status || "new"}</td>
                    <td className="p-3 whitespace-nowrap">{(d.createdAt || "").slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-2 md:hidden">
            {rows.map((d) => (
              <button key={d.id} onClick={() => { setOpenId(d.id); setNote(d.staffNote || ""); }} className="w-full text-left rounded-2xl border bg-white p-4 text-sm">
                <p><strong>{d.name || "—"}</strong> · {d.status || "new"}</p>
                <p className="text-forest-muted">{[d.email, d.phone].filter(Boolean).join(" · ")}</p>
                <p className="text-forest-muted truncate">{d.message || d.subject || d.skills || ""}</p>
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <button disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded-full border px-4 py-1 disabled:opacity-40 bg-white">← Prev</button>
            <span aria-live="polite">Page {page + 1} of {pages} ({filtered.length} total)</span>
            <button disabled={page + 1 >= pages} onClick={() => setPage(page + 1)} className="rounded-full border px-4 py-1 disabled:opacity-40 bg-white">Next →</button>
          </div>
        </>
      )}

      {open && (
        <div role="dialog" aria-modal="true" aria-label={`Submission from ${open.name || open.email || open.id}`} className="fixed inset-0 z-50 bg-forest/70 p-4 overflow-y-auto" onClick={() => setOpenId(null)}>
          <div className="mx-auto max-w-2xl rounded-3xl bg-ivory p-6 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start gap-3">
              <h2 className="font-editorial text-2xl">{open.name || "Submission"}</h2>
              <button onClick={() => setOpenId(null)} aria-label="Close details" className="rounded-full border px-4 py-1 text-sm shrink-0">Close (Esc)</button>
            </div>
            <dl className="mt-4 grid gap-2 text-sm">
              {(FIELDS[kind] || []).map(([k, label]) => (
                open[k] ? <div key={k} className="grid md:grid-cols-[140px_1fr] gap-1 border-b pb-1"><dt className="text-forest-muted">{label}</dt><dd className="whitespace-pre-wrap break-words">{String(open[k])}</dd></div> : null
              ))}
              <div className="grid md:grid-cols-[140px_1fr] gap-1 border-b pb-1"><dt className="text-forest-muted">Submitted</dt><dd>{open.createdAt || "—"}</dd></div>
              {open.reviewedBy && <div className="grid md:grid-cols-[140px_1fr] gap-1 border-b pb-1"><dt className="text-forest-muted">Last review</dt><dd>{open.reviewedBy} · {open.reviewedAt}</dd></div>}
            </dl>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm font-medium">Status
                <select value={open.status || "new"} onChange={(e) => save(open.id, { status: e.target.value })} className="border rounded-xl px-3 py-2 bg-white font-normal">
                  {meta.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium">Private staff note (never public)
                <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="border rounded-xl px-3 py-2 bg-white font-normal" placeholder="Only staff can see this." />
              </label>
              <div>
                <button onClick={() => save(open.id, { staffNote: note })} className="rounded-full bg-forest text-white px-5 py-2 text-sm font-semibold">Save note</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
