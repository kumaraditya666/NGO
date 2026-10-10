import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-20 text-center">
      <h1 className="font-editorial text-5xl">Lost the path?</h1>
      <p className="mt-3 text-forest-muted">That page doesn't exist. Try home, programs or donate.</p>
      <div className="mt-5 flex justify-center gap-2"><Link href="/" className="rounded-full bg-forest text-white px-5 py-2 text-sm">Home</Link><Link href="/donate" className="rounded-full border px-5 py-2 text-sm">Donate</Link></div>
    </div>
  );
}
