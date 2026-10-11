import { isDemoMode } from "@/lib/config";

export default function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <p className="bg-slate-100 text-center text-[12px] text-slate-600 font-sans py-1.5 px-4">
      Demo prototype — no live donations.
    </p>
  );
}
