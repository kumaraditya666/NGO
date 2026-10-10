"use client";
import { useEffect, useState } from "react";
import { Field, inputCls } from "@/components/forms";

const AMOUNTS = [101, 501, 1100, 2100, 5100];

export default function DonateFlow({ programs, campaigns, settings }: any) {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ name: "", email: "", phone: "", fundType: "general", fundId: "", amount: 501, custom: "", message: "", anonymous: false, consent: false });
  const [created, setCreated] = useState<any>(null);
  const [v, setV] = useState({ utr: "", paidAt: new Date().toISOString().slice(0, 10), note: "", cannotFindRef: false, proof: null as File | null });
  const [msg, setMsg] = useState("");
  const amount = f.custom ? Number(f.custom) : f.amount;
  const set = (k: string, val: any) => setF({ ...f, [k]: val });

  async function createDonation(e: React.FormEvent) {
    e.preventDefault(); setMsg("Creating donation…");
    const res = await fetch("/api/donations/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: f.name, email: f.email, phone: f.phone, fundType: f.fundType, fundId: f.fundId, amount, message: f.message, anonymous: f.anonymous, consent: f.consent }) });
    const j = await res.json();
    if (!res.ok) { setMsg(j.error || "Failed"); return; }
    setCreated(j); setStep(2); setMsg("");
  }

  async function submitProof(e: React.FormEvent) {
    e.preventDefault(); setMsg("Submitting…");
    let proofId = "";
    if (v.proof) {
      const fd = new FormData();
      fd.append("file", v.proof);
      fd.append("reference", created.reference);
      const up = await fetch("/api/donations/upload", { method: "POST", body: fd });
      const uj = await up.json();
      if (!up.ok) { setMsg(uj.error || "Upload failed"); return; }
      proofId = uj.file;
    }
    const res = await fetch("/api/donations/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference: created.reference, utr: v.utr, paidAt: v.paidAt, note: v.note, cannotFindRef: v.cannotFindRef, proofFile: proofId }) });
    const j = await res.json();
    if (!res.ok) { setMsg(j.error || "Failed"); return; }
    setCreated({ ...created, ...j }); setStep(3); setMsg("");
  }

  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t); setMsg("Copied: " + t); } catch { setMsg(t); } };

  return (
    <div>
      <ol className="flex gap-2 text-sm mt-6" aria-label="Donation steps">
        {["1 · Details", "2 · Pay", "3 · Confirm"].map((s, i) => (
          <li key={s} className={`rounded-full border px-4 py-1.5 ${step === i + 1 ? "bg-brand text-white" : "text-slate-500"}`}>{s}</li>
        ))}
      </ol>

      {step === 1 && (
        <form onSubmit={createDonation} className="mt-6 rounded-3xl border bg-white p-6 grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Full name *"><input required className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Email *"><input required type="email" className={inputCls} value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Phone (optional)"><input className={inputCls} value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="Fund"><select className={inputCls} value={f.fundType} onChange={(e) => set("fundType", e.target.value)}><option value="general">General fund</option><option value="program">Program</option><option value="campaign">Campaign</option></select></Field>
            {f.fundType === "program" && <Field label="Program"><select className={inputCls} value={f.fundId} onChange={(e) => set("fundId", e.target.value)}><option value="">Choose…</option>{programs.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></Field>}
            {f.fundType === "campaign" && <Field label="Campaign"><select className={inputCls} value={f.fundId} onChange={(e) => set("fundId", e.target.value)}><option value="">Choose…</option>{campaigns.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></Field>}
          </div>
          <div>
            <p className="text-sm font-medium">Amount (₹) *</p>
            <div className="mt-2 flex flex-wrap gap-2">{AMOUNTS.map((a) => <button type="button" key={a} onClick={() => { set("amount", a); set("custom", ""); }} className={`rounded-full border px-4 py-2 text-sm ${!f.custom && f.amount === a ? "bg-brand text-white" : ""}`}>₹{a.toLocaleString("en-IN")}</button>)}
              <input placeholder="Custom" inputMode="numeric" className="border rounded-full px-4 py-2 text-sm w-36" value={f.custom} onChange={(e) => set("custom", e.target.value.replace(/[^0-9]/g, ""))} /></div>
            <p className="text-xs text-slate-500 mt-1">Minimum ₹10. No online payment here — you pay in your own UPI/bank app next.</p>
          </div>
          <Field label="Message (optional)"><textarea rows={3} className={inputCls} value={f.message} onChange={(e) => set("message", e.target.value)} /></Field>
          <label className="text-sm flex gap-2"><input type="checkbox" checked={f.anonymous} onChange={(e) => set("anonymous", e.target.checked)} /> Keep my name private in public acknowledgements (internal records are still kept).</label>
          <label className="text-sm flex gap-2"><input type="checkbox" required checked={f.consent} onChange={(e) => set("consent", e.target.checked)} /> I consent to being contacted about this donation and understand verification is manual. *</label>
          <button className="rounded-full bg-brand text-white px-6 py-3 font-semibold">Continue to payment →</button>
          {msg && <p className="text-sm">{msg}</p>}
        </form>
      )}

      {step === 2 && created && (
        <div className="mt-6 grid md:grid-cols-2 gap-5">
          <div className="rounded-3xl border bg-white p-6">
            <p className="text-sm">You are donating <strong className="font-sans font-extrabold text-2xl">₹{Number(created.amount).toLocaleString("en-IN")}</strong></p>
            <p className="text-sm mt-1">Reference: <strong>{created.reference}</strong> — write it in your payment note.</p>
            <div className="mt-4 rounded-2xl border p-4 text-center">
              <p className="text-xs uppercase tracking-widest text-brand font-semibold">Scan with any UPI app</p>
              <img src={settings.qrImage} alt="UPI QR code" className="mx-auto mt-2 h-52 w-52 object-contain border rounded-xl" />
              <a href={settings.qrImage} download className="text-sm underline text-brand">Download QR</a>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {[["UPI ID", settings.upiId], ["Account holder", settings.accountHolder], ["Bank", settings.bankName], ["Account number", settings.accountNumber], ["IFSC", settings.ifsc]].map(([k, val]) => (
                <div key={k} className="flex items-center justify-between gap-2 border-b py-1.5"><span className="text-slate-500">{k}: <strong className="text-ink">{val}</strong></span><button type="button" onClick={() => copy(String(val))} className="rounded-full border px-3 py-1 text-xs">Copy</button></div>
              ))}
            </div>
            <p className="mt-3 text-[13px] bg-amber-50 border border-amber-200 rounded-xl p-3">⚠️ In your payment app, verify the recipient name matches <strong>{settings.accountHolder}</strong> before paying. Opening an app or scanning never counts as success — only a staff-verified credit does.</p>
          </div>
          <form onSubmit={submitProof} className="rounded-3xl border bg-cream p-6 grid gap-3 content-start">
            <h2 className="font-sans font-bold text-xl">Step 3: submit payment reference</h2>
            <Field label="UTR / transaction reference * (or tick below if you can't find it)" hint="12-digit UTR for UPI/NEFT; check payment history."><input required={!v.cannotFindRef} className={inputCls} value={v.utr} onChange={(e) => setV({ ...v, utr: e.target.value })} placeholder="e.g. 412345678901" /></Field>
            <Field label="Payment date *"><input required type="date" className={inputCls} value={v.paidAt} onChange={(e) => setV({ ...v, paidAt: e.target.value })} /></Field>
            <Field label="Screenshot (optional, JPG/PNG/PDF ≤ 5MB)"><input type="file" accept=".jpg,.jpeg,.png,.pdf" className={inputCls} onChange={(e) => setV({ ...v, proof: e.target.files?.[0] || null })} /></Field>
            <Field label="Note (optional)"><input className={inputCls} value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} /></Field>
            <label className="text-sm flex gap-2"><input type="checkbox" checked={v.cannotFindRef} onChange={(e) => setV({ ...v, cannotFindRef: e.target.checked })} /> I paid but cannot find the reference — please help trace it.</label>
            <button className="rounded-full bg-brand text-white px-6 py-3 font-semibold">Submit for verification</button>
            {msg && <p className="text-sm">{msg}</p>}
          </form>
        </div>
      )}

      {step === 3 && created && (
        <div className="mt-6 rounded-3xl bg-[#0f2a43] text-white p-8 text-center">
          <p className="font-sans font-extrabold text-3xl">Submitted — awaiting payment verification.</p>
          <p className="mt-2 text-ivory/80">Reference <strong>{created.reference}</strong> · Amount ₹{Number(created.amount).toLocaleString("en-IN")}</p>
          <p className="mt-2 text-sm text-white/70">Confirmation comes only after staff match the credit. Keep this link private:</p>
          <p className="mt-2 text-sm break-all bg-white/10 rounded-xl p-3">/donate/status?ref={created.reference}&token={created.token}</p>
          <div className="mt-4 flex justify-center gap-2"><a className="rounded-full bg-white text-ink px-5 py-2 text-sm font-semibold" href={`/donate/status?ref=${created.reference}&token=${created.token}`}>Check status</a><a className="rounded-full border border-white/40 px-5 py-2 text-sm" href="/">Home</a></div>
          <p className="mt-3 text-xs text-white/60">Questions? Ask us via the Contact page. If you cannot find your UTR, staff will still review your note.</p>
        </div>
      )}
    </div>
  );
}
