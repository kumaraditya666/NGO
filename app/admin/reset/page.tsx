"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function Inner() {
  const sp = useSearchParams();
  const token = sp.get("token") || "";
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg("Saving…");
    try {
      const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const j = await res.json();
      if (!res.ok) setMsg(j.error || "Something went wrong.");
      else setDone(true);
    } catch {
      setMsg("Something went wrong.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <p className="text-xs uppercase tracking-widest text-terracotta font-semibold">Staff only · not indexed</p>
      <h1 className="font-editorial text-4xl mt-2">Set a new password</h1>
      {done ? (
        <div className="mt-6 rounded-3xl border bg-white p-6">
          <p className="font-semibold">Password updated.</p>
          <p className="text-sm mt-1"><Link href="/admin/login" className="underline">Sign in with your new password</Link>.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 rounded-3xl border bg-white p-6 grid gap-3">
          {!token && <p className="text-sm">This reset link is missing its token. Please use the full link from your email.</p>}
          <label className="grid gap-1 text-sm font-medium">New password (min 8 characters)
            <input required type="password" minLength={8} autoComplete="new-password" className="border rounded-xl px-3 py-2 font-normal" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button disabled={busy || !token} className="rounded-full bg-forest text-white px-5 py-2.5 font-semibold disabled:opacity-60">
            {busy ? "Saving…" : "Set password"}
          </button>
          {msg && <p className="text-sm" role="status">{msg}</p>}
        </form>
      )}
    </div>
  );
}

export default function ResetPage() {
  return <Suspense><Inner /></Suspense>;
}
