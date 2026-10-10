"use client";
import { useEffect, useRef, useState } from "react";
import type { VideoItem } from "@/lib/types";

/**
 * Featured videos / reels. Cards link out to the exact supplied URL (new tab) —
 * no embeds, no autoplay. Arrows appear only when the row overflows; the row
 * itself scrolls natively (touch + keyboard accessible).
 */
export default function VideoStories({ items }: { items: VideoItem[] }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  function measure() {
    const el = rowRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  function scrollBy(dir: number) {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 640), behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={rowRef}
        onScroll={measure}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4"
        role="list"
        aria-label="Featured videos and reels"
      >
        {items.map((v) => (
          <a
            key={v.id}
            role="listitem"
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch: ${v.title} (opens in a new tab)`}
            className="group snap-start shrink-0 w-[82%] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] block overflow-hidden rounded-lg bg-white border border-slate-200 hover:shadow-lg transition-shadow focus-visible:outline-2 focus-visible:outline-brand"
          >
            <span className="relative block overflow-hidden">
              <img
                src={encodeURI(v.cover)}
                alt={v.coverAlt || v.title}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <span aria-hidden className="absolute inset-0 grid place-items-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-[#0f2a43]/80 transition group-hover:bg-accent group-hover:scale-105 motion-reduce:transition-none">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                    <path d="M8 5.5v13l11-6.5z" />
                  </svg>
                </span>
              </span>
              <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-sans font-bold uppercase tracking-wider text-white">
                {v.platform === "instagram" ? "Reel" : v.platform === "youtube" ? "Video" : "Watch"}
              </span>
            </span>
            <span className="block p-4">
              <span className="font-sans font-bold text-[15px] text-ink leading-snug">{v.title}</span>
            </span>
          </a>
        ))}
      </div>
      {(canPrev || canNext) && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => scrollBy(-1)}
            disabled={!canPrev}
            aria-label="Show previous videos"
            className="grid h-11 w-11 place-items-center rounded-full border border-slate-300 text-xl text-ink hover:border-brand hover:text-brand transition disabled:opacity-30"
          >
            ‹
          </button>
          <button
            onClick={() => scrollBy(1)}
            disabled={!canNext}
            aria-label="Show next videos"
            className="grid h-11 w-11 place-items-center rounded-full border border-slate-300 text-xl text-ink hover:border-brand hover:text-brand transition disabled:opacity-30"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
