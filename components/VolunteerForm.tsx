"use client";
import { useState } from "react";
import { Field, inputCls, usePublicForm } from "@/components/forms";
export default function VolunteerForm({ programs, events, opps }: any) {
  const { msg, ok, post } = usePublicForm("/api/volunteer");
  const [f, setF] = useState({ name: "", email: "", phone: "", location: "", skills: "", interests: "", availability: "", programId: "", eventId: "", message: "", consent: false });
  const set = (k: string, v: any) => setF({ ...f, [k]: v });
  const openRoles = (opps || []).filter((o: any) => o.open);
  if (ok) return (
    <div className="rounded-xl border border-slate-200 bg-cream p-8 text-center font-sans">
      <p className="font-sans font-extrabold text-2xl text-ink">Thank you, {f.name.split(" ")[0] || "friend"}!</p>
      <p className="mt-2 text-sm text-slate-600">{msg}</p>
    </div>
  );
  return (
    <form onSubmit={(e) => { e.preventDefault(); post(f); }} className="rounded-xl border border-slate-200 bg-white p-6 grid gap-4 font-sans">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Full name *"><input required className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" /></Field>
        <Field label="Email"><input type="email" className={inputCls} value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" /></Field>
        <Field label="Phone"><input className={inputCls} value={f.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" /></Field>
        <Field label="City or area"><input className={inputCls} value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Your city or area" /></Field>
        <Field label="Skills"><input className={inputCls} value={f.skills} onChange={(e) => set("skills", e.target.value)} placeholder="teaching, design, driving…" /></Field>
        <Field label="Availability"><input className={inputCls} value={f.availability} onChange={(e) => set("availability", e.target.value)} placeholder="weekends, 4 hrs/week" /></Field>
        {programs.length > 0 && (
          <Field label="Preferred programme"><select className={inputCls} value={f.programId} onChange={(e) => set("programId", e.target.value)}><option value="">Any</option>{programs.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></Field>
        )}
        {events.length > 0 && (
          <Field label="Preferred event"><select className={inputCls} value={f.eventId} onChange={(e) => set("eventId", e.target.value)}><option value="">None</option>{events.map((p: any) => <option key={p.id} value={p.id}>{p.title} ({p.date})</option>)}</select></Field>
        )}
      </div>
      <Field label="Area of interest"><input className={inputCls} value={f.interests} onChange={(e) => set("interests", e.target.value)} placeholder="What would you like to help with?" /></Field>
      <Field label="Message (optional)"><textarea className={inputCls} rows={4} value={f.message} onChange={(e) => set("message", e.target.value)} /></Field>
      <p className="text-[13px] text-slate-500">Only your name and one way to reach you (email or phone) are required.</p>
      <label className="text-sm flex gap-2 items-start text-slate-700"><input type="checkbox" required checked={f.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1" /> I consent to being contacted about volunteering. *</label>
      <button className="rounded-md bg-brand text-white px-6 py-3 font-sans font-bold hover:bg-brand-dark transition">Submit application</button>
      {msg && <p className="text-sm text-slate-600" role="status">{msg}</p>}
      {openRoles.length > 0 && (
        <div className="rounded-xl bg-cream border border-slate-200 p-4 text-sm text-slate-700">
          <strong>Open roles:</strong>{" "}
          {openRoles.map((o: any) => `${o.title} (${o.location}; ${o.commitment})`).join(" · ")}
        </div>
      )}
    </form>
  );
}
