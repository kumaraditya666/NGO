"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const primary = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Our Work" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

const involved = [
  { href: "/volunteer", label: "Volunteer" },
  { href: "/in-kind", label: "Give Supplies" },
  { href: "/corporate", label: "Corporate Partnerships" },
];

export default function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDrop(false);
        setOpen(false);
      }
    }
    function onClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDrop(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const active = (h: string) =>
    path === h ? "text-brand" : "text-slate-700 hover:text-brand-dark";

  return (
    <header className="enter-header sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-[1240px] px-4 flex items-center justify-between h-[68px] gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Shikshaa Sewa Charitable Trust — home">
          <Image
            src="/logo.jpg"
            alt="Shikshaa Sewa Charitable Trust"
            width={100}
            height={89}
            priority
            className="h-11 w-auto rounded-sm bg-white"
          />
          <span className="leading-tight">
            <span className="block font-sans font-extrabold text-[18px] text-ink">Shikshaa Sewa</span>
            <span className="block text-[10px] font-sans font-bold uppercase tracking-[0.14em] text-slate-500">
              Charitable Trust
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-[14.5px] font-sans font-semibold" aria-label="Primary">
          <Link href="/" className={active("/")}>Home</Link>
          <Link href="/about" className={active("/about")}>About</Link>
          <Link href="/programs" className={active("/programs")}>Our Work</Link>
          <Link href="/gallery" className={active("/gallery")}>Gallery</Link>
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDrop(!drop)}
              aria-expanded={drop}
              aria-haspopup="true"
              className="text-slate-700 hover:text-brand-dark flex items-center gap-1 font-semibold"
            >
              Get Involved <span aria-hidden className={`text-xs transition-transform ${drop ? "rotate-180" : ""}`}>▾</span>
            </button>
            {drop && (
              <div className="absolute left-0 top-full mt-2 w-60 rounded-lg border border-slate-200 bg-white shadow-xl py-2" role="menu">
                {involved.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    role="menuitem"
                    onClick={() => setDrop(false)}
                    className="block px-4 py-2 text-slate-700 hover:bg-cream hover:text-brand-dark"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/contact" className={active("/contact")}>Contact</Link>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/support"
            className="rounded-md bg-brand px-5 md:px-6 py-2.5 text-sm font-sans font-bold text-white hover:bg-brand-dark transition"
          >
            Support Us
          </Link>
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="lg:hidden rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-brand"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-slate-200 px-4 py-3 bg-white max-h-[70vh] overflow-y-auto" aria-label="Mobile">
          {[...primary.slice(0, 4)].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block py-2.5 text-[15px] font-sans font-semibold border-b border-slate-100 ${active(l.href)}`}
            >
              {l.label}
            </Link>
          ))}
          <p className="pt-3 pb-1 text-[12px] font-sans font-bold uppercase tracking-widest text-slate-500">Get Involved</p>
          {involved.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block py-2.5 pl-3 text-[15px] font-sans font-semibold border-b border-slate-100 ${active(l.href)}`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className={`block py-2.5 text-[15px] font-sans font-semibold ${active("/contact")}`}
          >
            Contact
          </Link>
          <Link
            href="/support"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-md bg-brand px-4 py-3 text-center text-white font-bold"
          >
            Support Us
          </Link>
        </nav>
      )}
    </header>
  );
}
