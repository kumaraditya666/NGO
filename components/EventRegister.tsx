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
    else setMsg(j.error || "Registration failed — please try again or contact us.");
  }
  if (ok) return <div className="rounded-xl bg-cream border border-slate-200 p-5 font-sans"><p className="font-sans font-bold text-ink">You&apos;re registered.</p><p className="text-sm mt-1 text-slate-600">{msg}</p><a className="text-sm underline text-brand font-bold" href={`/api/events/ics?eventId=${eventId}`}>Add to calendar (.ics)</a></div>;
  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-5 grid gap-3 font-sans">
      <h3 className="font-sans font-bold text-ink">Register</h3>
      <input required placeholder="Name" aria-label="Your name" className="border border-slate-300 rounded-md px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input required type="email" placeholder="Email" aria-label="Email" className="border border-slate-300 rounded-md px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Phone (optional)" aria-label="Phone (optional)" className="border border-slate-300 rounded-md px-3 py-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <label className="text-sm text-slate-700">Seats <input type="number" min={1} max={10} value={form.seats} onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })} className="border border-slate-300 rounded-md px-2 py-1 w-20 ml-2" /></label>
      <button className="rounded-md bg-brand text-white px-5 py-2.5 text-sm font-sans font-bold hover:bg-brand-dark transition">Confirm registration</button>
      {msg && <p className="text-sm text-slate-600" role="status">{msg}</p>}
    </form>
  );
}
