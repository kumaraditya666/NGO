"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
function Inner() {
  const sp = useSearchParams();
  const ref = sp.get("ref") || "";
  const token = sp.get("token") || "";
  const [html, setHtml] = useState("");
  useEffect(() => {
    fetch(`/api/donations/ack?reference=${encodeURIComponent(ref)}&token=${encodeURIComponent(token)}`).then(async (r) => {
      const t = await r.text();
      setHtml(t);
    });
  }, [ref, token]);
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-editorial text-3xl">Acknowledgement</h1>
      <div className="mt-4 rounded-3xl border bg-white p-6 text-sm whitespace-pre-wrap">{html || "Loading…"}</div>
      <button onClick={() => window.print()} className="mt-4 rounded-full bg-forest text-white px-5 py-2 text-sm">Print / save PDF</button>
      <p className="mt-2 text-xs text-forest-muted">This is an acknowledgement of a confirmed donation, not a tax certificate. Tax wording requires separate client approval.</p>
    </div>
  );
}
export default function AckPage() {
  return <Suspense><Inner /></Suspense>;
}
