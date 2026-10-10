import Link from "next/link";
import Reveal from "@/components/Reveal";
import DonateFlow from "@/components/DonateFlow";
import { SectionHeading } from "@/components/ui";
import { getPrograms, getCampaigns } from "@/lib/content";
import { readCollection } from "@/lib/store";
export const metadata = { title: "Donate", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function Donate() {
  const [programs, campaigns, settings] = await Promise.all([
    getPrograms(),
    getCampaigns(),
    readCollection<any>("settings", {}),
  ]);
  const open = settings.donationsEnabled === true;
  return (
    <div className="mx-auto max-w-5xl px-5 py-12 font-sans">
      <Reveal>
        <SectionHeading
          kicker="Donate"
          title={open ? "Pay outside, verify inside" : "Online donations opening soon"}
          lede={
            open
              ? "You pay in your own UPI/bank app, then submit the reference. Staff verify every credit by hand."
              : "The NGO's bank account is still being opened, so we cannot accept money yet — and we will not ask for any until every detail is verified."
          }
        />
      </Reveal>
      {!open ? (
        <Reveal>
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-7 md:p-10">
            <h2 className="font-sans font-extrabold text-slate-900 text-2xl">Meanwhile, you can still help</h2>
            <p className="mt-2 text-slate-600">
              No payment details are shown here on purpose — there is nowhere to send money yet.
              These actions work today:
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/volunteer" className="rounded-md bg-teal-700 px-6 py-3 font-sans font-bold text-white hover:bg-teal-800 transition">
                Become a Volunteer
              </Link>
              <Link href="/in-kind" className="rounded-md border border-slate-300 px-6 py-3 font-sans font-bold text-slate-800 hover:border-slate-500 transition">
                Give Supplies
              </Link>
              <Link href="/contact" className="rounded-md border border-slate-300 px-6 py-3 font-sans font-bold text-slate-800 hover:border-slate-500 transition">
                Contact Us
              </Link>
            </div>
          </div>
        </Reveal>
      ) : (
        <DonateFlow
          programs={programs.filter((p) => p.state === "published")}
          campaigns={campaigns.filter((c) => c.publish === "published")}
          settings={settings}
        />
      )}
    </div>
  );
}
