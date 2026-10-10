"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export default function AdminLogin() {
  const [f, setF] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const router = useRouter();
  useEffect(() => {
    fetch("/api/auth/me").then(async (r) => {
      const j = await r.json();
      if (j.user) router.replace("/admin/dashboard");
    });
  }, [router]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg("Signing in…");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const j = await res.json();
    if (!res.ok) { setMsg(j.error); return; }
    location.href = "/admin/dashboard";
  }
  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <p className="text-xs uppercase tracking-widest text-terracotta font-semibold">Staff only · not indexed</p>
      <h1 className="font-editorial text-4xl mt-2">Admin sign in</h1>
      <p className="text-sm text-forest-muted mt-2">First run: uses ADMIN_EMAIL / ADMIN_PASSWORD from env to bootstrap the administrator, then manage staff in Admin → Staff.</p>
      <form onSubmit={submit} className="mt-6 rounded-3xl border bg-white p-6 grid gap-3">
        <input required type="email" placeholder="Email" className="border rounded-xl px-3 py-2" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input required type="password" placeholder="Password" className="border rounded-xl px-3 py-2" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <button className="rounded-full bg-forest text-white px-5 py-2.5 font-semibold">Sign in</button>
        {msg && <p className="text-sm">{msg}</p>}
      </form>
    </div>
  );
}
