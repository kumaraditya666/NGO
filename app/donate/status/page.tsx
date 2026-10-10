"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
function Inner() {
  const sp = useSearchParams();
  const ref = sp.get("ref") || "";
  const token = sp.get("token") || "";
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState("Loading…");
  useEffect(() => {
    if (!ref || !token) { setMsg("Missing reference or secure token."); return; }
    fetch(`/api/donations/status?reference=${encodeURIComponent(ref)}&token=${encodeURIComponent(token)}`).then(async (r) => {
      const j = await r.json();
      if (!r.ok) setMsg(j.error || "Not found");
      else { setData(j); setMsg(""); }
    });
  }, [ref, token]);
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 font-sans">
      <h1 className="font-sans font-extrabold text-ink text-3xl">Donation status</h1>
      {msg && <p className="mt-4 text-sm text-slate-600">{msg}</p>}
      {data && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
          <p>Reference: <strong>{data.reference}</strong></p>
          <p>Amount: <strong>₹{Number(data.amount).toLocaleString("en-IN")}</strong></p>
          <p>Status: <strong>{data.status.replace(/_/g, " ")}</strong></p>
          {data.status === "confirmed" && <a className="mt-3 inline-block rounded-md bg-brand text-white px-5 py-2 font-sans font-bold" href={`/donate/ack?ref=${ref}&token=${token}`}>Download acknowledgement</a>}
          {data.status !== "confirmed" && <p className="mt-2 text-slate-500">Awaiting staff verification — confirmation comes only after the bank credit is matched.</p>}
        </div>
      )}
    </div>
  );
}
export default function StatusPage() {
  return <Suspense><Inner /></Suspense>;
}
