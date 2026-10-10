"use client";
import { useState } from "react";
import { Field, inputCls, usePublicForm } from "@/components/forms";
export default function VolunteerForm({ programs, events, opps }: any) {
  const { msg, ok, post } = usePublicForm("/api/volunteer");
  const [f, setF] = useState({ name: "", email: "", phone: "", location: "", skills: "", interests: "", availability: "", programId: "", eventId: "", message: "", consent: false });
  const set = (k: string, v: any) => setF({ ...f, [k]: v });
  if (ok) return <div className="rounded-3xl bg-parchment border p-8 text-center"><p className="font-editorial text-2xl">Thank you, {f.name.split(" ")[0] || "friend"}!</p><p className="mt-2 text-sm">{msg} Our team reviews every application by hand.</p></div>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); post(f); }} className="rounded-3xl border bg-white p-6 grid gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Full name *"><input required className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Email *"><input required type="email" className={inputCls} value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="Phone (optional)"><input className={inputCls} value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Location"><input className={inputCls} value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="[City / area]" /></Field>
        <Field label="Skills"><input className={inputCls} value={f.skills} onChange={(e) => set("skills", e.target.value)} placeholder="teaching, design, driving…" /></Field>
        <Field label="Availability"><input className={inputCls} value={f.availability} onChange={(e) => set("availability", e.target.value)} placeholder="weekends, 4 hrs/week" /></Field>
        <Field label="Preferred program"><select className={inputCls} value={f.programId} onChange={(e) => set("programId", e.target.value)}><option value="">Any</option>{programs.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></Field>
        <Field label="Preferred event"><select className={inputCls} value={f.eventId} onChange={(e) => set("eventId", e.target.value)}><option value="">None</option>{events.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></Field>
      </div>
      <Field label="Interests"><input className={inputCls} value={f.interests} onChange={(e) => set("interests", e.target.value)} /></Field>
      <Field label="Message"><textarea className={inputCls} rows={4} value={f.message} onChange={(e) => set("message", e.target.value)} /></Field>
      <label className="text-sm flex gap-2 items-start"><input type="checkbox" required checked={f.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1" /> I consent to being contacted about volunteering. *</label>
      <button className="rounded-full bg-terracotta text-white px-6 py-3 font-semibold">Submit application</button>
      {msg && <p className="text-sm text-forest-muted">{msg}</p>}
      <div className="rounded-2xl bg-parchment p-4 text-sm"><strong>Open roles (sample):</strong> {opps.filter((o: any) => o.open).map((o: any) => o.title).join(" · ")}</div>
    </form>
  );
}
