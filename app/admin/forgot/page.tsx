"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg("Sending…");
    try {
      const res = await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const j = await res.json();
      setMsg(res.ok ? j.message : j.error || "Something went wrong.");
    } catch {
      setMsg("Something went wrong.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <p className="text-xs uppercase tracking-widest text-terracotta font-semibold">Staff only · not indexed</p>
      <h1 className="font-editorial text-4xl mt-2">Forgot password</h1>
      <form onSubmit={submit} className="mt-6 rounded-3xl border bg-white p-6 grid gap-3">
        <label className="grid gap-1 text-sm font-medium">Staff email
          <input required type="email" className="border rounded-xl px-3 py-2 font-normal" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        </label>
        <button disabled={busy} className="rounded-full bg-forest text-white px-5 py-2.5 font-semibold disabled:opacity-60">
          {busy ? "Sending…" : "Send reset link"}
        </button>
        {msg && <p className="text-sm" role="status">{msg}</p>}
        <p className="text-sm"><Link href="/admin/login" className="underline">Back to sign in</Link></p>
      </form>
    </div>
  );
}
