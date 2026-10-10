"use client";
import { useState } from "react";
import { Field, inputCls, usePublicForm } from "@/components/forms";
export default function PledgeForm({ pickup }: { pickup: boolean }) {
  const { msg, ok, busy, post } = usePublicForm("/api/enquiries");
  const [f, setF] = useState({ name: "", email: "", phone: "", item: "", qty: "", message: "", consent: false, company: "" });
  const set = (k: string, v: any) => setF({ ...f, [k]: v });
  if (ok) return (
    <div className="rounded-xl border border-slate-200 bg-cream p-6 font-sans">
      <p className="font-sans font-bold text-ink">Pledge received.</p>
      <p className="text-sm text-slate-600 mt-1">{msg}</p>
    </div>
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        post({
          name: f.name, email: f.email, phone: f.phone, kind: "inkind-pledge",
          subject: `Pledge: ${f.item} x ${f.qty || "?"}`,
          message: `Item: ${f.item}\nQuantity: ${f.qty || "not specified"}\nDetails: ${f.message}\nPickup: ${pickup ? "area to be discussed" : "not offered — drop-off only"}`,
          consent: f.consent,
          company: f.company,
        });
      }}
      className="rounded-xl border border-slate-200 bg-white p-6 grid gap-4 font-sans"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Name *"><input required className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" /></Field>
        <Field label="Email *"><input required type="email" className={inputCls} value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" /></Field>
        <Field label="Phone (optional)"><input className={inputCls} value={f.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" /></Field>
        <Field label="Quantity"><input className={inputCls} value={f.qty} onChange={(e) => set("qty", e.target.value)} placeholder="e.g. 20" /></Field>
      </div>
      <Field label="Item you can give *"><input required className={inputCls} value={f.item} onChange={(e) => set("item", e.target.value)} placeholder="e.g. children's storybooks in good condition" /></Field>
      <Field label="Condition and location"><textarea className={inputCls} rows={3} value={f.message} onChange={(e) => set("message", e.target.value)} placeholder="condition, your area…" /></Field>
      <label className="text-sm flex gap-2 text-slate-700"><input type="checkbox" required checked={f.consent} onChange={(e) => set("consent", e.target.checked)} /> I consent to being contacted about this pledge. *</label>
      <input type="text" name="company" value={f.company} autoComplete="off" tabIndex={-1} aria-hidden="true" className="hidden" onChange={(e) => set("company", e.target.value)} />
      <button disabled={busy} className="rounded-md bg-brand text-white px-6 py-3 font-sans font-bold hover:bg-brand-dark transition disabled:opacity-60">{busy ? "Sending…" : "Pledge item"}</button>
      {msg && <p className="text-sm text-slate-600" role="status">{msg}</p>}
    </form>
  );
}
