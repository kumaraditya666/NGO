"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export interface GalleryPhoto {
  id: string;
  category: string;
  image: string;
  thumb?: string;
  caption: string;
  alt: string;
  width?: number;
  height?: number;
}

export default function GalleryClient({
  items,
  limit,
  showFilters = true,
}: {
  items: GalleryPhoto[];
  limit?: number;
  showFilters?: boolean;
}) {
  const [cat, setCat] = useState("");
  const [index, setIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);

  const cats = Array.from(new Set(items.map((i) => i.category)));
  const filtered = items.filter((i) => !cat || i.category === cat);
  const visible = typeof limit === "number" ? filtered.slice(0, limit) : filtered;
  const light = index !== null ? visible[index] : null;

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d: number) => setIndex((p) => (p === null ? p : (p + d + visible.length) % visible.length)),
    [visible.length]
  );

  // Scroll lock + keyboard while open; focus the close button on open.
  useEffect(() => {
    if (index === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [index, close, step]);

  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  }

  return (
    <div>
      {showFilters && cats.length > 1 && (
        <div className="flex flex-wrap gap-2 mt-6" role="group" aria-label="Filter photos by category">
          <button
            onClick={() => { setCat(""); setIndex(null); }}
            aria-pressed={cat === ""}
            className={`rounded-full border px-4 py-1.5 text-sm font-sans ${!cat ? "bg-teal-700 text-white border-teal-700" : "border-slate-300 text-slate-700"}`}
          >
            All
          </button>
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => { setCat(c); setIndex(null); }}
              aria-pressed={cat === c}
              className={`rounded-full border px-4 py-1.5 text-sm font-sans ${cat === c ? "bg-teal-700 text-white border-teal-700" : "border-slate-300 text-slate-700"}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 && (
        <p className="mt-6 text-slate-600 border border-slate-200 rounded-lg p-5 bg-white">
          No photos here yet — check back soon.
        </p>
      )}

      {/* Masonry grid preserves each photo's natural proportions (no face cropping). */}
      <div className="mt-6 columns-2 sm:columns-3 gap-4">
        {visible.map((g, k) => (
          <button
            key={g.id}
            onClick={() => setIndex(k)}
            aria-label={`Open photo: ${g.alt || `photo ${k + 1}`}`}
            className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-lg border border-slate-200 bg-white text-left hover:shadow-lg transition-shadow"
          >
            <img
              src={encodeURI(g.thumb || g.image)}
              alt={g.alt}
              width={g.width}
              height={g.height}
              loading={k < 2 ? undefined : "lazy"}
              className="w-full h-auto block"
            />
            {g.caption ? (
              <span className="block px-3 py-2.5 text-[13px] text-slate-600 font-sans">{g.caption}</span>
            ) : null}
          </button>
        ))}
      </div>

      {light && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={light.alt || "Photo viewer"}
          className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center"
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative max-w-5xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={encodeURI(light.image)}
              alt={light.alt}
              className="max-h-[82vh] w-full object-contain rounded-lg"
            />
            <div className="mt-3 flex items-center justify-between gap-3 text-white">
              <p className="font-sans text-sm text-white/80" aria-live="polite">
                {(index ?? 0) + 1} / {visible.length}
                {light.caption ? <span className="block mt-1 text-white">{light.caption}</span> : null}
              </p>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-xl hover:bg-white/30 transition"
                >
                  ‹
                </button>
                <button
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-xl hover:bg-white/30 transition"
                >
                  ›
                </button>
                <button
                  ref={closeRef}
                  onClick={close}
                  aria-label="Close photo viewer"
                  className="h-11 px-5 rounded-full bg-white text-slate-900 font-sans text-sm font-bold hover:bg-slate-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
