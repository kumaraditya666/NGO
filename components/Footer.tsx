import Link from "next/link";
import { readCollection } from "@/lib/store";

export default async function Footer() {
  const settings = await readCollection<any>("settings", {});
  const name = settings.displayName || settings.ngoName || "Paaji";
  const email = settings.contactEmail || "";
  const phone = settings.contactPhone || "";
  return (
    <footer className="mt-20 bg-[#0f2a43] text-white font-sans">
      <div className="mx-auto max-w-[1240px] px-4 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <p className="font-sans text-2xl font-extrabold">{name}</p>
          <p className="mt-2 text-sm text-white/70">
            A community-rooted nonprofit in India — education, health and livelihoods.
          </p>
          {(email || phone) && (
            <p className="mt-4 text-sm">
              {email && (
                <a className="underline hover:text-teal-200" href={`mailto:${email}`}>{email}</a>
              )}
              {email && phone && <br />}
              {phone && (
                <a className="underline hover:text-teal-200" href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a>
              )}
            </p>
          )}
          {!email && !phone && (
            <p className="mt-4 text-sm text-white/70">
              Direct contact details are being confirmed.{" "}
              <Link href="/contact" className="underline hover:text-teal-200">Write to us here</Link>.
            </p>
          )}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about" className="hover:underline">About</Link></li>
            <li><Link href="/programs" className="hover:underline">Our Work</Link></li>
            <li><Link href="/gallery" className="hover:underline">Gallery</Link></li>
            <li><Link href="/transparency" className="hover:underline">Transparency</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Get Involved</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/volunteer" className="hover:underline">Volunteer</Link></li>
            <li><Link href="/in-kind" className="hover:underline">Give Supplies</Link></li>
            <li><Link href="/corporate" className="hover:underline">Corporate Partnerships</Link></li>
            <li><Link href="/support" className="hover:underline">Support Us</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Trust</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
            <li><Link href="/privacy" className="hover:underline">Privacy</Link></li>
            <li><Link href="/donation-policy" className="hover:underline">Donation &amp; Refund</Link></li>
            <li><Link href="/terms" className="hover:underline">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto max-w-[1240px] px-4 py-4 text-xs text-white/60 flex flex-wrap gap-2 justify-between">
          <span>© {new Date().getFullYear()} {name} · Community-rooted nonprofit, India.</span>
          <span>Online donations open only after verified payment details are published.</span>
        </div>
      </div>
    </footer>
  );
}
