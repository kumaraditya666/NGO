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
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-terracotta">{kicker}</p>
      <h2 className="font-editorial mt-2 text-3xl md:text-4xl leading-tight">{title}</h2>
      <div className="rule-gold mt-4 w-24" />
      {lede && <p className="mt-4 text-forest-muted leading-relaxed">{lede}</p>}
    </div>
  );
}

export function ProgressBar({ pct }: { pct: number }) {
  const v = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <div className="h-2.5 rounded-full bg-forest/10 overflow-hidden" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-terracotta" style={{ width: `${v}%` }} />
    </div>
  );
}

export function inr(n: number) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}
