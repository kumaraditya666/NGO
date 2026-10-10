"use client";
import { useState } from "react";
export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg("…");
    const r = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const j = await r.json();
    setMsg(r.ok ? j.message + " Email sends only when SMTP is configured." : j.error);
  }
  return (
    <form onSubmit={submit} className="mt-3 flex gap-2">
      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email for updates" aria-label="Email for newsletter" className="rounded-full px-4 py-2 text-sm text-forest w-full" />
      <button className="rounded-full bg-gold text-forest px-4 py-2 text-sm font-semibold shrink-0">Join</button>
      {msg && <span className="sr-only" role="status">{msg}</span>}
    </form>
  );
}
