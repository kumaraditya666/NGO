"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export interface Slide {
  src: string;
  alt: string;
  position?: string;
}

export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const n = slides.length;
  const go = useCallback((d: number) => setI((p) => (p + d + n) % n), [n]);

  // Keyboard arrows when the carousel region is focused
  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured stories"
      onKeyDown={onKey}
      className="relative bg-slate-950 overflow-hidden"
    >
      <div className="relative h-[540px] md:h-[620px]">
        {slides.map((s, k) => (
          <div
            key={s.src}
            aria-hidden={k !== i}
            className={`absolute inset-0 motion-safe:transition-opacity motion-safe:duration-700 ${
              k === i ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={s.src}
              alt={k === i ? s.alt : ""}
              loading={k === 0 ? undefined : "lazy"}
              className="h-full w-full object-cover"
              style={{ objectPosition: s.position || "50% 35%" }}
            />
          </div>
        ))}
        {/* readability overlays: stronger on the right (desktop), bottom (mobile) */}
        <div aria-hidden className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/25 to-black/10 md:bg-none" />
        <div aria-hidden className="absolute inset-0 z-20 hidden md:block bg-gradient-to-l from-black/75 via-black/30 to-transparent" />

        {/* text block — right half on desktop, bottom on mobile */}
        <div className="absolute inset-0 z-30">
          <div className="mx-auto max-w-[1240px] px-5 h-full flex items-end pb-20 md:pb-0 md:items-center md:justify-end">
            <div className="max-w-xl md:pr-6" aria-live="polite">
              <p className="font-sans text-[12px] font-bold uppercase tracking-[0.24em] text-teal-300">
                Paaji · India
              </p>
              <h1 className="font-sans mt-3 font-extrabold text-white text-[2rem] md:text-6xl leading-[1.05]">
                Together, we can
                <br />
                change lives.
              </h1>
              <p className="mt-4 text-white/85 font-sans text-[15px] md:text-lg max-w-md">
                Learning, health and green livelihoods — run with neighbours, counted in the open.
              </p>
              <div className="mt-6">
                <Link
                  href="/donate"
                  className="inline-block rounded-md bg-teal-600 px-9 py-3.5 font-sans font-bold text-white hover:bg-teal-500 transition"
                >
                  Support Us
                </Link>
                <div>
                  <Link href="/volunteer" className="mt-3 inline-block font-sans text-sm font-semibold text-white underline underline-offset-4 hover:text-teal-200">
                    Become a Volunteer →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* discreet stock-photo marking */}
        <p className="absolute left-4 bottom-3 z-30 font-sans text-[11px] text-white/60">
          Illustrative photography
        </p>

        {/* prev / next */}
        {n > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white text-xl hover:bg-white/35 transition"
            >
              ‹
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next slide"
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white text-xl hover:bg-white/35 transition"
            >
              ›
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {slides.map((s, k) => (
                <button
                  key={s.src}
                  onClick={() => setI(k)}
                  aria-label={`Go to slide ${k + 1}`}
                  aria-current={k === i}
                  className={`h-2.5 rounded-full transition-all ${k === i ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
