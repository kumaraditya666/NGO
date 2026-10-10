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
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Link href="/campaigns" className="text-sm text-terracotta underline">← All campaigns</Link>
      <h1 className="font-editorial text-4xl md:text-5xl mt-3">{campaign.title}</h1>
      <p className="mt-2 text-forest-muted">Goal {inr(campaign.goalAmount)} · Deadline {campaign.deadline} · Status: {campaign.state}</p>
      <img src={campaign.image} alt={campaign.title} className="mt-6 rounded-3xl w-full aspect-[21/9] object-cover border border-forest/10" />
      <div className="mt-6 rounded-3xl border bg-white p-6">
        <ProgressBar pct={pct} />
        <p className="mt-2"><strong className="font-editorial text-2xl">{inr(raised.total)}</strong> raised ({pct}%)</p>
        <p className="text-sm text-forest-muted">Website-confirmed {inr(raised.online)} + offline-verified {inr(raised.offline)}. Pending and rejected donations are excluded.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/donate" className="rounded-full bg-terracotta text-white px-6 py-2.5 font-semibold">Donate to this campaign</Link>
          <button onClick={() => share("whatsapp")} className="rounded-full border px-4 py-2 text-sm">Share WhatsApp</button>
          <button onClick={() => share("x")} className="rounded-full border px-4 py-2 text-sm">Share X</button>
          <button onClick={() => share("copy")} className="rounded-full border px-4 py-2 text-sm">Copy link</button>
          {copied && <span className="text-sm text-forest-muted">{copied}</span>}
        </div>
      </div>
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl border bg-parchment p-6"><h2 className="font-editorial text-xl">Purpose</h2><p className="text-sm mt-2 leading-relaxed">{campaign.purpose}</p><h3 className="font-semibold mt-4">Approved budget (sample — verify)</h3><ul className="text-sm mt-2 space-y-1">{campaign.budget.map((b: any) => <li key={b.label} className="flex justify-between border-b border-forest/10 py-1"><span>{b.label}</span><span>{inr(b.amount)}</span></li>)}</ul></div>
        <div className="rounded-3xl border bg-white p-6"><h2 className="font-editorial text-xl">Updates</h2>{updates.length === 0 ? <p className="text-sm text-forest-muted mt-2">No updates yet.</p> : updates.map((u: any) => <div key={u.id} className="mt-3 border-t pt-3"><p className="text-xs text-forest-muted">{u.date}</p><p className="font-semibold">{u.title}</p><p className="text-sm">{u.body}</p></div>)}</div>
      </div>
    </div>
  );
}
