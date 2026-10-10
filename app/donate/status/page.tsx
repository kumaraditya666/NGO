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
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-editorial text-3xl">Donation status</h1>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
      {data && (
        <div className="mt-4 rounded-3xl border bg-white p-6 text-sm">
          <p>Reference: <strong>{data.reference}</strong></p>
          <p>Amount: <strong>₹{Number(data.amount).toLocaleString("en-IN")}</strong></p>
          <p>Status: <strong>{data.status.replace(/_/g, " ")}</strong></p>
          {data.status === "confirmed" && <a className="mt-3 inline-block rounded-full bg-forest text-white px-5 py-2" href={`/donate/ack?ref=${ref}&token=${token}`}>Download acknowledgement</a>}
          {data.status !== "confirmed" && <p className="mt-2 text-forest-muted">Awaiting staff verification — confirmation comes only after the bank credit is matched.</p>}
        </div>
      )}
    </div>
  );
}
export default function StatusPage() {
  return <Suspense><Inner /></Suspense>;
}
