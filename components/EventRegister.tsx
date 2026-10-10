"use client";
import { useState } from "react";
export default function EventRegister({ eventId }: { eventId: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", seats: 1 });
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg("Registering…");
    const res = await fetch("/api/events/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventId, ...form, consent: true }) });
    const j = await res.json();
    if (res.ok) { setOk(true); setMsg(`Registered! ${j.registered}/${j.capacity} seats filled.`); }
    else setMsg(j.error || "Registration failed");
  }
  if (ok) return <div className="rounded-2xl bg-parchment border p-5"><p className="font-semibold">You're registered ✔</p><p className="text-sm mt-1">{msg}</p><a className="text-sm underline text-terracotta" href={`/api/events/ics?eventId=${eventId}`}>Add to calendar (.ics)</a></div>;
  return (
    <form onSubmit={submit} className="rounded-2xl border bg-white p-5 grid gap-3">
      <h3 className="font-semibold">Register</h3>
      <input required placeholder="Name" className="border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input required type="email" placeholder="Email" className="border rounded px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Phone (optional)" className="border rounded px-3 py-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <label className="text-sm">Seats <input type="number" min={1} max={10} value={form.seats} onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })} className="border rounded px-2 py-1 w-20 ml-2" /></label>
      <button className="rounded-full bg-forest text-white px-5 py-2 text-sm font-semibold">Confirm registration</button>
      {msg && <p className="text-sm text-forest-muted">{msg}</p>}
    </form>
  );
}
