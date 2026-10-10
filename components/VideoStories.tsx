"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoItem } from "@/lib/types";

/** Extract a YouTube video ID from watch / youtu.be / shorts / embed / live URLs. */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^m\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{6,20}$/.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "www.youtube.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id && /^[\w-]{6,20}$/.test(id) ? id : null;
      }
      const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([\w-]{6,20})/);
      return m ? m[2] : null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Featured videos. Desktop: one large card + two stacked, extras in a compact
 * row. Mobile/tablet: swipeable row with arrows + dots. YouTube opens an
 * accessible popup (iframe loads on click, removed on close); Instagram opens
 * the exact reel URL in a new tab. No autoplay anywhere.
 */
export default function VideoStories({ items }: { items: VideoItem[] }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const measure = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    const perView = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
    const n = Math.max(1, Math.ceil(items.length / perView));
    setPages(n);
    setPage(Math.min(n - 1, Math.round(el.scrollLeft / Math.max(el.clientWidth, 1))));
  }, [items.length]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  function scrollBy(dir: number) {
    rowRef.current?.scrollBy({ left: dir * Math.min(rowRef.current.clientWidth * 0.85, 640), behavior: "smooth" });
  }
  function goPage(p: number) {
    rowRef.current?.scrollTo({ left: p * rowRef.current.clientWidth, behavior: "smooth" });
  }

  const open = items.find((v) => v.id === openId) || null;
  const openYt = open && open.platform === "youtube" ? youtubeId(open.url) : null;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dlg = dialogRef.current;
    dlg?.querySelector<HTMLButtonElement>("[data-close]")?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpenId(null); return; }
      if (e.key === "Tab" && dlg) {
        const f = Array.from(dlg.querySelectorAll<HTMLElement>("button, a[href]")).filter((x) => !x.hasAttribute("disabled"));
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  function openPopup(v: VideoItem, el: HTMLElement) {
    triggerRef.current = el;
    setOpenId(v.id);
  }

  const [first, ...rest] = items;
  const stacked = rest.slice(0, 2);
  const extra = rest.slice(2);

  function thumb(v: VideoItem, large = false) {
    return (
      <span className="relative block overflow-hidden">
        <img
          src={encodeURI(v.cover)}
          alt={v.coverAlt || v.title}
          width={large ? 960 : 640}
          height={large ? 540 : 360}
          loading="lazy"
          className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <span aria-hidden className="absolute inset-0 grid place-items-center">
          <span className={`${large ? "h-16 w-16" : "h-12 w-12"} grid place-items-center rounded-full bg-[#0f2a43]/80 transition group-hover:bg-accent group-hover:scale-105 motion-reduce:transition-none`}>
            {v.platform === "instagram" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
                <circle cx="12" cy="12" r="4.2" />
                <circle cx="17.4" cy="6.6" r="0.6" fill="#fff" stroke="none" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            )}
          </span>
        </span>
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-sans font-bold uppercase tracking-wider text-white">
          {v.platform === "instagram" ? "Reel" : "Video"}
        </span>
      </span>
    );
  }

  function titleBlock(v: VideoItem) {
    return (
      <span className="block p-4">
        <span className="font-sans font-bold text-[15px] text-ink leading-snug">{v.title}</span>
        {v.caption ? <span className="mt-1 block text-[13px] text-slate-600">{v.caption}</span> : null}
      </span>
    );
  }

  function card(v: VideoItem, big = false) {
    const cls = `group block overflow-hidden rounded-lg bg-white border border-slate-200 hover:shadow-lg transition-shadow focus-visible:outline-2 focus-visible:outline-brand ${big ? "" : "snap-start shrink-0"}`;
    const inner = (
      <>
        {thumb(v, big)}
        {titleBlock(v)}
      </>
    );
    return v.platform === "youtube" ? (
      <button
        key={v.id}
        type="button"
        onClick={(e) => openPopup(v, e.currentTarget)}
        aria-haspopup="dialog"
        className={`${cls} text-left`}
      >
        {inner}
      </button>
    ) : (
      <a
        key={v.id}
        href={v.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${v.title} (opens in a new tab)`}
        className={cls}
      >
        {inner}
      </a>
    );
  }

  return (
    <div className="relative">
      {/* Desktop featured composition */}
      {first && (
        <div className="hidden lg:grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">{card(first, true)}</div>
          <div className="grid gap-5 content-start">
            {stacked.map((v) => card(v))}
          </div>
        </div>
      )}
      {extra.length > 0 && (
        <div className="hidden lg:grid lg:grid-cols-4 gap-5 mt-5">
          {extra.map((v) => card(v))}
        </div>
      )}

      {/* Tablet/mobile swipe row */}
      <div
        ref={rowRef}
        onScroll={measure}
        className="flex lg:hidden gap-5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4"
        role="list"
        aria-label="Featured videos and reels"
      >
        {items.map((v) => (
          <div key={v.id} role="listitem" className="snap-start shrink-0 w-[82%] sm:w-[calc(50%-10px)]">
            {card(v)}
          </div>
        ))}
      </div>
      <div className="mt-4 flex lg:hidden items-center gap-3">
        {(canPrev || canNext) && (
          <>
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
          </>
        )}
        {pages > 1 && (
          <div className="ml-1 flex gap-2" role="tablist" aria-label="Video pages">
            {Array.from({ length: pages }).map((_, k) => (
              <button
                key={k}
                role="tab"
                aria-selected={page === k}
                aria-label={`Go to video page ${k + 1}`}
                onClick={() => goPage(k)}
                className={`h-2.5 rounded-full transition-all ${page === k ? "w-8 bg-brand" : "w-2.5 bg-slate-300 hover:bg-slate-400"}`}
              />
            ))}
          </div>
        )}
      </div>

      {open && openYt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Video player: ${open.title}`}
          className="fixed inset-0 z-50 bg-slate-950/95 grid place-items-center p-4"
          onClick={() => setOpenId(null)}
        >
          <div ref={dialogRef} className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${openYt}?autoplay=1&rel=0`}
                title={open.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <a
                href={open.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm font-semibold text-white underline underline-offset-4"
              >
                Open on YouTube
              </a>
              <button
                data-close
                onClick={() => setOpenId(null)}
                className="h-11 px-6 rounded-full bg-white font-sans text-sm font-bold text-ink hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
