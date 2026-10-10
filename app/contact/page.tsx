import EnquiryForm from "@/components/EnquiryForm";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { siteConfig } from "@/lib/config";
export const metadata = { title: "Contact" };
export default function Contact() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Reveal><SectionHeading kicker="Contact" title="Talk to a human" /></Reveal>
      <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
        <div className="rounded-3xl border bg-white p-6"><p><strong>Address</strong><br />{siteConfig.address}</p><p className="mt-2"><strong>Hours</strong><br />{siteConfig.hours}</p><p className="mt-2"><strong>Email</strong><br /><a className="underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></p><p className="mt-2"><strong>Phone</strong><br /><a className="underline" href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a></p><p className="mt-3 flex gap-2"><a className="rounded-full bg-forest text-white px-4 py-2" href={`tel:${siteConfig.phone}`}>Click to call</a><a className="rounded-full border px-4 py-2" target="_blank" href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent("Hello, I have a question.")}`}>WhatsApp</a><a className="rounded-full border px-4 py-2" target="_blank" href="https://maps.google.com/?q=India">Map</a></p></div>
        <div className="rounded-3xl border bg-parchment p-6"><h2 className="font-semibold">Send a message</h2><div className="mt-3"><EnquiryForm kind="contact" /></div></div>
      </div>
    </div>
  );
}
