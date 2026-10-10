"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell, useMe } from "@/components/admin";

const KIND_LINK: Record<string, string> = {
  volunteers: "/admin/dashboard/inbox?kind=volunteers",
  contact: "/admin/dashboard/inbox?kind=enquiries",
  partnership: "/admin/dashboard/inbox?kind=enquiries",
  general: "/admin/dashboard/inbox?kind=enquiries",
  "inkind-pledge": "/admin/dashboard/inbox?kind=inkind_pledges",
  "event-registration": "/admin/dashboard/inbox?kind=registrations",
  donations: "/admin/dashboard/donations",
};

export default function NotificationsAdmin() {
  const { me, loading } = useMe();
  const [jobs, setJobs] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [msg, setMsg] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function load(s = status) {
    setState("loading");
    try {
      const r = await fetch(`/api/admin/notifications${s ? `?status=${s}` : ""}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to load");
      setJobs(j.jobs);
      setState("idle");
    } catch (e: any) {
      setMsg(e.message);
      setState("error");
    }
  }
  useEffect(() => { load(); }, []);

  async function retry(id: string) {
    setMsg("Retrying…");
    const r = await fetch("/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const j = await r.json().catch(() => ({}));
    setMsg(r.ok ? `Retry finished: ${j.result?.sent || 0} sent, ${j.result?.failed || 0} still failing.` : j.error || "Retry failed.");
    load(status);
  }

  if (loading) return <p className="p-8">Loading…</p>;
  return (
    <Shell me={me} title="Email notifications">
      <p className="text-sm text-forest-muted max-w-2xl">
        Every notification email passes through here. <strong>Failed</strong> means it was never
        delivered — the underlying submission is always safe. Retrying reuses the same job, so
        nobody ever gets the same email twice. “Accepted by provider” (message ID) is not proof
        of delivery unless a delivery webhook is configured (none is).
      </p>
      <div className="mt-3 flex gap-2 text-sm">
        <select value={status} onChange={(e) => { setStatus(e.target.value); load(e.target.value); }} aria-label="Filter by status" className="border rounded-full px-3 py-1.5 bg-white">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      {msg && <p className="mt-2 text-sm" role="status">{msg}</p>}
      {state === "loading" && <p className="mt-4 text-sm">Loading…</p>}
      {state === "error" && <p className="mt-4 text-sm">Could not load. Your role may not include this section.</p>}
      {state === "idle" && jobs.length === 0 && (
        <p className="mt-4 rounded-2xl border bg-white p-5 text-sm">No notification jobs{status ? ` with status “${status}”` : ""}.</p>
      )}
      <div className="mt-4 space-y-2">
        {jobs.map((j) => (
          <div key={j.id} className="rounded-2xl border bg-white p-4 text-sm">
            <p>
              <strong>{j.subject}</strong>
            </p>
            <p className="text-forest-muted">
              To {j.to} · {j.purpose} · ref {j.refId} · {j.attempts}/{j.maxAttempts} attempts · {j.createdAt?.slice(0, 16).replace("T", " ")}
            </p>
            <p className="mt-1">
              Status: <strong>{j.status}</strong>
              {j.messageId ? <span className="text-forest-muted"> · provider accepted ({String(j.messageId).slice(0, 24)}…)</span> : null}
              {j.lastError ? <span className="block text-forest-muted">Last error: {j.lastError}</span> : null}
            </p>
            <div className="mt-2 flex gap-2">
              {KIND_LINK[j.refKind] && (
                <Link href={KIND_LINK[j.refKind]} className="rounded-full border px-3 py-1 text-xs">Open record</Link>
              )}
              {j.status !== "sent" && (
                <button onClick={() => { if (confirm(`Retry sending to ${j.to}?`)) retry(j.id); }} className="rounded-full border px-3 py-1 text-xs">Retry</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}
