"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginForm({ next }: { next?: string }) {
  const [f, setF] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  useEffect(() => {
    fetch("/api/auth/me").then(async (r) => {
      const j = await r.json();
      if (j.user) router.replace(next || "/admin/dashboard");
    });
  }, [router, next]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg("Signing in…");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f), signal: ctrl.signal });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg(j.error || "Sign-in failed. Please try again."); return; }
      location.href = next || "/admin/dashboard";
    } catch {
      setMsg("Could not reach the server. Make sure it is running (npm run dev), then refresh this page and try again.");
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <p className="text-xs uppercase tracking-widest text-terracotta font-semibold">Staff only · not indexed</p>
      <h1 className="font-editorial text-4xl mt-2">Admin sign in</h1>
      <form onSubmit={submit} className="mt-6 rounded-3xl border bg-white p-6 grid gap-3">
        <label className="grid gap-1 text-sm font-medium">Email
          <input required type="email" placeholder="you@example.org" autoComplete="username" className="border rounded-xl px-3 py-2 font-normal" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </label>
        <label className="grid gap-1 text-sm font-medium">Password
          <input required type="password" placeholder="••••••••" autoComplete="current-password" className="border rounded-xl px-3 py-2 font-normal" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        </label>
        <button disabled={busy} className="rounded-full bg-forest text-white px-5 py-2.5 font-semibold disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
        {msg && <p className="text-sm" role="status">{msg}</p>}
        <p className="text-sm">
          <Link href="/admin/forgot" className="underline">Forgot your password?</Link>
        </p>
      </form>
    </div>
  );
}
