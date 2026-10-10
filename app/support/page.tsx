import Link from "next/link";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
export const metadata = { title: "Support Us" };
export const dynamic = "force-dynamic";
export default function Support() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12 font-sans">
      <Reveal>
        <SectionHeading
          kicker="Support Us"
          title="Help while donations are being set up"
          lede="Online donations open only after the NGO's bank account is active. Until then, these are the ways to stand with the work — each one reaches the team directly."
        />
      </Reveal>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {[
          { t: "Volunteer", b: "Give time and skills. Every application is read by a person who replies.", href: "/volunteer", cta: "Apply to Volunteer" },
          { t: "Give Supplies", b: "Offer goods the team actually needs right now. Pledges go to staff for review.", href: "/in-kind", cta: "See How It Works" },
          { t: "Contact the Team", b: "Questions, partnerships, or anything else — write and a person responds.", href: "/contact", cta: "Get in Touch" },
        ].map((c, k) => (
          <Reveal key={c.t} delay={k * 80}>
            <div className="h-full rounded-xl border border-slate-200 bg-white p-6 flex flex-col">
              <h2 className="font-sans font-bold text-xl text-slate-900">{c.t}</h2>
              <p className="mt-2 text-slate-600 text-[15px] leading-relaxed flex-1">{c.b}</p>
              <Link href={c.href} className="mt-4 inline-block rounded-md bg-teal-700 px-5 py-2.5 text-center font-sans text-sm font-bold text-white hover:bg-teal-800 transition">
                {c.cta}
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <p className="mt-8 rounded-xl bg-slate-50 border border-slate-200 p-5 text-sm text-slate-600">
          We will never ask for money through this page until verified payment details are published
          here by the NGO itself. If anyone asks you to pay on our behalf, treat it as fraud and{" "}
          <Link href="/contact" className="font-bold text-teal-700 underline">tell us</Link>.
        </p>
      </Reveal>
    </div>
  );
}
