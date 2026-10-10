import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center font-sans">
      <h1 className="font-sans font-extrabold text-slate-900 text-5xl">Lost the path?</h1>
      <p className="mt-3 text-slate-600">That page doesn&apos;t exist. Try home, our work or support.</p>
      <div className="mt-5 flex justify-center gap-2">
        <Link href="/" className="rounded-md bg-teal-700 text-white px-5 py-2 text-sm font-sans font-bold hover:bg-teal-800 transition">Home</Link>
        <Link href="/support" className="rounded-md border border-slate-300 px-5 py-2 text-sm font-sans font-bold text-slate-800">Support Us</Link>
      </div>
    </div>
  );
}
