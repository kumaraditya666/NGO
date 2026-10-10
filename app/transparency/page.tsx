import Link from "next/link";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { readCollection } from "@/lib/store";
export const metadata = { title: "Transparency" };
export const dynamic = "force-dynamic";
export default async function Transparency() {
  const reports = await readCollection<any[]>("reports", []);
  const settings = await readCollection<any>("settings", {});
  const legal = (settings.legalName || "").trim();
  const docs = reports.filter((r: any) => r.kind !== "ngo-profile");
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 font-sans">
      <Reveal>
        <SectionHeading
          kicker="Transparency"
          title="Open books, plain words"
          lede="Only approved information and documents appear here. Donor contact details, payment references and beneficiary records are never published."
        />
      </Reveal>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-[15px] leading-relaxed text-slate-600">
        <h2 className="font-sans font-bold text-xl text-ink">Legal identity</h2>
        <p className="mt-2">
          {legal
            ? <>{legal} — registration documents appear below once approved for publication.</>
            : "The registered legal name and registration documents are being confirmed with the trustees and will be published here once approved."}
        </p>
        <h2 className="font-sans font-bold text-xl text-ink mt-6">How support is used</h2>
        <p className="mt-2">
          Money: online donations stay closed until the NGO&apos;s bank account is active and
          verified payment details are published. When open, only confirmed gifts count toward
          totals — pending and rejected gifts never do, and website gifts are listed separately
          from verified offline contributions. Time and goods: volunteer applications and supply
          pledges go to staff for review, and every confirmation is logged.
        </p>
        {docs.length > 0 ? (
          <>
            <h2 className="font-sans font-bold text-xl text-ink mt-6">Documents and reports</h2>
            <ul className="mt-2 space-y-1">
              {docs.map((r: any) => <li key={r.id}><a className="underline text-brand" href={r.url}>{r.title}{r.year ? ` (${r.year})` : ""}</a></li>)}
            </ul>
          </>
        ) : (
          <p className="mt-4 text-sm">
            No registration documents or reports published yet. When the NGO approves them,
            they appear here. Questions? <Link href="/contact" className="underline text-brand font-bold">Contact the team</Link>.
          </p>
        )}
      </div>
    </div>
  );
}
