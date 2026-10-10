"use client";
import { useState } from "react";
import { Field, inputCls, usePublicForm } from "@/components/forms";
export default function PledgeForm({ items, pickup }: any) {
  const { msg, ok, post } = usePublicForm("/api/enquiries");
  const [f, setF] = useState({ name: "", email: "", item: "", qty: "", message: "", consent: false });
  const set = (k: string, v: any) => setF({ ...f, [k]: v });
  if (ok) return <div className="rounded-2xl bg-parchment border p-6"><p className="font-semibold">Pledge recorded.</p><p className="text-sm">{msg}</p></div>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); post({ ...f, kind: "inkind-pledge", message: `Item: ${f.item} x ${f.qty}. ${f.message} Pickup requested: ${pickup ? "n/a" : "not offered"}` }); }} className="rounded-3xl border bg-white p-6 grid gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Name *"><input required className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Email *"><input required type="email" className={inputCls} value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="Item *"><select required className={inputCls} value={f.item} onChange={(e) => set("item", e.target.value)}><option value="">Choose…</option>{items.map((i: any) => <option key={i.id} value={i.label}>{i.label} (need {i.needed} {i.unit})</option>)}</select></Field>
        <Field label="Quantity"><input className={inputCls} value={f.qty} onChange={(e) => set("qty", e.target.value)} /></Field>
      </div>
      <Field label="Note"><textarea className={inputCls} rows={3} value={f.message} onChange={(e) => set("message", e.target.value)} placeholder="condition, location…" /></Field>
      <label className="text-sm flex gap-2"><input type="checkbox" required checked={f.consent} onChange={(e) => set("consent", e.target.checked)} /> I consent to being contacted. *</label>
      <button className="rounded-full bg-forest text-white px-6 py-3 font-semibold">Pledge item</button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
