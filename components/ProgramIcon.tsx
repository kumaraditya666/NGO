/** Simple consistent icons for programme cards without a matching photograph. */

const paths: Record<string, JSX.Element> = {
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
      <path d="M8 7.5h8" />
    </>
  ),
  shirt: (
    <>
      <path d="M9 3 4 6.5 2.5 11l3 1.5V21h13v-8.5l3-1.5L20 6.5 15 3a3 3 0 0 1-6 0z" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19C5 9 13 4 20 4c0 8-5 15-15 15z" />
      <path d="M5 19c3-5 7-9 11-11" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z" />
      <path d="M9.5 12l2 2 3.5-4" />
    </>
  ),
  hands: (
    <>
      <path d="M12 20s-6-3.5-6-9a3.5 3.5 0 0 1 6-2.5A3.5 3.5 0 0 1 18 11c0 5.5-6 9-6 9z" />
    </>
  ),
};

export default function ProgramIcon({ icon, size = 44 }: { icon?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[icon || ""] || paths.hands}
    </svg>
  );
}
