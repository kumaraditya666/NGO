"use client";
import { useEffect, useState } from "react";
import { Shell, useMe } from "@/components/admin";
const SETS = ["programs", "campaigns", "campaign_updates", "events", "stories", "articles", "gallery", "testimonials", "team", "reports", "faqs", "opportunities", "inkind_items"];
export default function ContentAdmin() {
  const { me, loading } = useMe();
  const [name, setName] = useState("programs");
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  async function load(n = name) {
    const r = await fetch(`/api/admin/collections?name=${n}`);
    const j = await r.json();
    if (r.ok) setText(JSON.stringify(j.data, null, 2));
    else setMsg(j.error);
  }
  useEffect(() => { load(); }, []);
  async function save() {
    setMsg("Saving…");
    try {
      const data = JSON.parse(text);
      const r = await fetch("/api/admin/collections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, data }) });
      const j = await r.json();
      setMsg(r.ok ? "Saved. Draft items (state=draft) stay private." : j.error);
    } catch { setMsg("Invalid JSON"); }
  }
  if (loading) return <p className="p-8">Loading…</p>;
  return (
    <Shell me={me} title="Content (draft / publish / archive)">
      <p className="text-sm text-forest-muted">Edit JSON with <code>state</code>/<code>publish</code> fields: draft stays private, published shows publicly, archived hides. Confirm before destructive edits.</p>
      <div className="mt-3 flex flex-wrap gap-2">{SETS.map((s) => <button key={s} onClick={() => { setName(s); load(s); }} className={`rounded-full border px-3 py-1 text-xs ${name === s ? "bg-forest text-white" : "bg-white"}`}>{s}</button>)}</div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={22} className="mt-3 w-full font-mono text-xs border rounded-2xl p-4" spellCheck={false} />
      <div className="mt-2 flex gap-2"><button onClick={save} className="rounded-full bg-forest text-white px-5 py-2 text-sm">Save {name}</button><span className="text-sm">{msg}</span></div>
    </Shell>
  );
}
