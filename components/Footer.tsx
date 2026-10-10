import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import { siteConfig } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="mt-20 bg-forest text-ivory">
      <div className="mx-auto max-w-6xl px-5 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <p className="font-serif text-2xl font-semibold">Paaji</p>
          <p className="mt-2 text-sm text-ivory/70">
            Community-rooted nonprofit work in India — education, health and livelihoods.
          </p>
          <p className="mt-4 text-sm">
            <a className="underline" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </a>
            <br />
            <a className="underline" href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}>
              {siteConfig.phone}
            </a>
          </p>
          <NewsletterForm />
          <p className="mt-1 text-[11px] text-ivory/50">With consent only. Unsubscribe anytime by writing to us.</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about" className="hover:underline">About</Link></li>
            <li><Link href="/programs" className="hover:underline">Programs</Link></li>
            <li><Link href="/campaigns" className="hover:underline">Campaigns</Link></li>
            <li><Link href="/impact" className="hover:underline">Impact & stories</Link></li>
            <li><Link href="/transparency" className="hover:underline">Transparency</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Contribute</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/donate" className="hover:underline">Donate</Link></li>
            <li><Link href="/volunteer" className="hover:underline">Volunteer</Link></li>
            <li><Link href="/corporate" className="hover:underline">Corporate partnerships</Link></li>
            <li><Link href="/in-kind" className="hover:underline">In-kind donations</Link></li>
            <li><Link href="/events" className="hover:underline">Events</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Trust</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
            <li><Link href="/privacy" className="hover:underline">Privacy (draft — needs review)</Link></li>
            <li><Link href="/donation-policy" className="hover:underline">Donation & refund (draft)</Link></li>
            <li><Link href="/terms" className="hover:underline">Terms (draft)</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/15">
        <div className="mx-auto max-w-6xl px-5 py-4 text-xs text-ivory/60 flex flex-wrap gap-2 justify-between">
          <span>© {new Date().getFullYear()} Paaji · Community-rooted nonprofit, India.</span>
          <span>Totals show confirmed website donations only, unless labelled offline-verified.</span>
        </div>
      </div>
    </footer>
  );
}
