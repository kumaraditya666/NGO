"use client";
import { useState } from "react";
export function usePublicForm(url: string) {
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  async function post(body: any) {
    setMsg("Sending…");
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) { setOk(true); setMsg(j.message || "Submitted — thank you."); return true; }
    setMsg(j.error || "Something went wrong"); return false;
  }
  return { msg, ok, post, setMsg };
}

export function Field({ label, children, hint }: any) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-forest-muted">{hint}</span>}
    </label>
  );
}

export const inputCls = "border border-forest/20 rounded-xl px-3 py-2.5 bg-white w-full";
