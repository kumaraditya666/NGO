import type { Metadata } from "next";
import { isDemoMode, emailConfigured } from "@/lib/config";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-parchment">
      <p className="bg-amber-50 border-b border-amber-200 text-[12px] text-amber-900 px-4 py-1.5 text-center">
        Developer status — {isDemoMode ? "local JSON store (Supabase not configured)" : "Supabase connected"} ·{" "}
        {emailConfigured ? "email sending configured" : "email not configured — messages are logged, not sent"} ·{" "}
        <a href="/transparency#launch-checklist" className="underline">launch checklist</a>
      </p>
      {children}
    </div>
  );
}
