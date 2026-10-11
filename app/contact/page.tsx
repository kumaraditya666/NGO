import EnquiryForm from "@/components/EnquiryForm";
import InstagramIcon from "@/components/InstagramIcon";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { readCollection } from "@/lib/store";
import { siteConfig } from "@/lib/config";
export const metadata = { title: "Contact" };
export const dynamic = "force-dynamic";
export default async function Contact() {
  const s = await readCollection<any>("settings", {});
  const email = (s.contactEmail || "").trim();
  const phone = (s.contactPhone || "").trim();
  const extraPhones = Array.isArray(s.contactPhones)
    ? s.contactPhones.map((p: unknown) => String(p || "").trim()).filter((p: string) => p && p !== phone)
    : [];
  const whatsapp = (s.whatsapp || "").trim();
  const address = (s.address || "").trim();
  const hours = (s.hours || "").trim();
  const mapUrl = (s.mapUrl || "").trim();
  const hasDirect = Boolean(email || phone || address);
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 font-sans">
      <Reveal>
        <SectionHeading kicker="Contact" title="Talk to a human" lede="Write through the form, call, or email — a person replies." />
      </Reveal>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-[15px]">
          {hasDirect ? (
            <>
              {address && <p><strong className="text-ink">Address</strong><br /><span className="text-slate-600">{address}</span></p>}
              {hours && <p className="mt-2"><strong className="text-ink">Hours</strong><br /><span className="text-slate-600">{hours}</span></p>}
              {email && <p className="mt-2"><strong className="text-ink">Email</strong><br /><a className="underline text-brand" href={`mailto:${email}`}>{email}</a></p>}
              {phone && <p className="mt-2"><strong className="text-ink">Phone</strong><br /><a className="underline text-brand" href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a></p>}
              {extraPhones.map((p: string) => (
                <p key={p} className="mt-2"><strong className="text-ink">Phone</strong><br /><a className="underline text-brand" href={`tel:${p.replace(/[^+\d]/g, "")}`}>{p}</a></p>
              ))}
              <p className="mt-3 flex flex-wrap gap-2">
                {phone && <a className="rounded-md bg-brand text-white px-4 py-2 text-sm font-sans font-bold hover:bg-brand-dark transition" href={`tel:${phone.replace(/[^+\d]/g, "")}`}>Call</a>}
                {whatsapp && <a className="rounded-md border border-slate-300 px-4 py-2 text-sm font-sans font-bold text-slate-800 hover:border-slate-500 transition" target="_blank" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello, I have a question.")}`}>WhatsApp</a>}
                {mapUrl && <a className="rounded-md border border-slate-300 px-4 py-2 text-sm font-sans font-bold text-slate-800 hover:border-slate-500 transition" target="_blank" href={mapUrl}>Map</a>}
              </p>
            </>
          ) : (
            <p className="text-slate-600">
              Phone, address and visiting hours are being confirmed with the team and will
              appear here. Until then, the message form is the fastest way to reach a person.
            </p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-cream p-6">
          <h2 className="font-sans font-bold text-ink">Send a message</h2>
          <div className="mt-3"><EnquiryForm kind="contact" /></div>
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-md text-sm font-sans font-semibold text-brand hover:text-brand-dark transition focus-visible:outline-2 focus-visible:outline-brand"
          >
            <InstagramIcon size={19} />
            Follow us on Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
