export function SectionHeading({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-sans text-[12px] font-bold uppercase tracking-[0.22em] text-brand">{kicker}</p>
      <h2 className="font-serif mt-2 font-semibold text-ink text-3xl md:text-[2.5rem] leading-[1.1]">{title}</h2>
      {lede && <p className="mt-4 text-slate-600 leading-relaxed">{lede}</p>}
    </div>
  );
}

export function ProgressBar({ pct }: { pct: number }) {
  const v = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-brand" style={{ width: `${v}%` }} />
    </div>
  );
}

export function inr(n: number) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}
