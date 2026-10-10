"use client";
import { useState } from "react";
import { Field, inputCls, usePublicForm } from "@/components/forms";
export default function EnquiryForm({ kind }: { kind: string }) {
  const { msg, ok, post } = usePublicForm("/api/enquiries");
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: "", message: "", consent: false });
  const set = (k: string, v: any) => setF({ ...f, [k]: v });
  if (ok) return <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 font-sans"><p className="font-sans font-bold text-slate-900">Received — thank you.</p><p className="text-sm mt-1 text-slate-600">{msg}</p></div>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); post({ ...f, kind }); }} className="rounded-xl border border-slate-200 bg-white p-6 grid gap-4 font-sans">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Name *"><input required className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" /></Field>
        <Field label="Email *"><input required type="email" className={inputCls} value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" /></Field>
        <Field label="Phone"><input className={inputCls} value={f.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" /></Field>
        <Field label="Subject"><input className={inputCls} value={f.subject} onChange={(e) => set("subject", e.target.value)} /></Field>
      </div>
      <Field label="Message *"><textarea required rows={5} className={inputCls} value={f.message} onChange={(e) => set("message", e.target.value)} /></Field>
      <label className="text-sm flex gap-2 text-slate-700"><input type="checkbox" required checked={f.consent} onChange={(e) => set("consent", e.target.checked)} /> I consent to being contacted. *</label>
      <button className="rounded-md bg-teal-700 text-white px-6 py-3 font-sans font-bold hover:bg-teal-800 transition">Send enquiry</button>
      {msg && <p className="text-sm text-slate-600" role="status">{msg}</p>}
    </form>
  );
}
