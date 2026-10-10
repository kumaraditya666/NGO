"use client";
import { useState } from "react";
import Link from "next/link";
import { ProgressBar, inr } from "@/components/ui";

export default function CampaignDetailClient({ campaign, updates, raised }: any) {
  const [copied, setCopied] = useState("");
  const pct = campaign.goalAmount ? Math.round((raised.total / campaign.goalAmount) * 100) : 0;
  const share = async (net: string) => {
    const url = window.location.href;
    const text = `${campaign.title} — ${inr(raised.total)} raised of ${inr(campaign.goalAmount)}`;
    if (net === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
    else if (net === "x") window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
    else {
      try { await navigator.clipboard.writeText(url); setCopied("Link copied"); } catch { setCopied(url); }
    }
  };
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-12 font-sans">
      <Link href="/campaigns" className="text-sm font-bold text-teal-700 underline">← All appeals</Link>
      <h1 className="font-sans font-extrabold text-slate-900 text-4xl md:text-5xl mt-3">{campaign.title}</h1>
      <p className="mt-2 text-slate-600">Goal {inr(campaign.goalAmount)} · Deadline {campaign.deadline} · Status: {campaign.state}</p>
      <img src={campaign.image} alt={campaign.title} className="mt-6 rounded-xl w-full aspect-[21/9] object-cover border border-slate-200" />
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <ProgressBar pct={pct} />
        <p className="mt-2 text-slate-900"><strong className="font-sans font-extrabold text-2xl">{inr(raised.total)}</strong> raised ({pct}%)</p>
        <p className="text-sm text-slate-600">Website-confirmed {inr(raised.online)} + offline-verified {inr(raised.offline)}. Pending and rejected donations are excluded.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/support" className="rounded-md bg-teal-700 text-white px-6 py-2.5 text-sm font-sans font-bold hover:bg-teal-800 transition">Support This Appeal</Link>
          <button onClick={() => share("whatsapp")} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-sans font-semibold text-slate-700">Share WhatsApp</button>
          <button onClick={() => share("x")} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-sans font-semibold text-slate-700">Share X</button>
          <button onClick={() => share("copy")} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-sans font-semibold text-slate-700">Copy link</button>
          {copied && <span className="text-sm text-slate-600">{copied}</span>}
        </div>
      </div>
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="font-sans font-bold text-xl text-slate-900">Purpose</h2>
          <p className="text-sm mt-2 leading-relaxed text-slate-600">{campaign.purpose}</p>
          <h3 className="font-sans font-bold mt-4 text-slate-900">Approved budget</h3>
          <ul className="text-sm mt-2 space-y-1 text-slate-700">{campaign.budget.map((b: any) => <li key={b.label} className="flex justify-between border-b border-slate-200 py-1"><span>{b.label}</span><span>{inr(b.amount)}</span></li>)}</ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-sans font-bold text-xl text-slate-900">Updates</h2>
          {updates.length === 0
            ? <p className="text-sm text-slate-600 mt-2">No updates yet.</p>
            : updates.map((u: any) => <div key={u.id} className="mt-3 border-t border-slate-100 pt-3"><p className="text-xs text-slate-500">{u.date}</p><p className="font-sans font-bold text-slate-900">{u.title}</p><p className="text-sm text-slate-600">{u.body}</p></div>)}
        </div>
      </div>
    </div>
  );
}
