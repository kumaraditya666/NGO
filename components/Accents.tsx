/** Lightweight decorative accents inspired by the NGO logo
 *  (sunrise rays, book-page curves, hand-drawn strokes).
 *  Purely decorative: always hidden from assistive technology. */

export function SunRays({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 200 120" className={className} fill="none">
      <g stroke="#F49A20" strokeWidth="5" strokeLinecap="round" opacity="0.85">
        <line x1="100" y1="8" x2="100" y2="34" />
        <line x1="45" y1="24" x2="60" y2="46" />
        <line x1="155" y1="24" x2="140" y2="46" />
        <line x1="18" y1="62" x2="44" y2="68" />
        <line x1="182" y1="62" x2="156" y2="68" />
      </g>
      <circle cx="100" cy="96" r="26" fill="#F49A20" opacity="0.9" />
    </svg>
  );
}

export function BookCurve({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 320 60" className={className} fill="none">
      <path d="M8 44 Q 90 8 160 34 T 312 30" stroke="#176A9A" strokeWidth="5" strokeLinecap="round" opacity="0.5" />
      <path d="M8 52 Q 92 20 160 44 T 312 40" stroke="#60AD43" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

export function OrangeStroke({ className = "", animate = false }: { className?: string; animate?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 260 18"
      preserveAspectRatio="none"
      className={`${animate ? "accent-draw" : ""} ${className}`}
      fill="none"
    >
      <path
        d="M4 12 Q 40 4 80 10 T 150 9 T 256 10"
        stroke="#F49A20"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}
