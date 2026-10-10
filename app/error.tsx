"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center font-sans">
      <h1 className="font-sans font-extrabold text-ink text-4xl">Something stumbled</h1>
      <p className="mt-3 text-sm text-slate-600">Please try again. If it keeps failing, contact us directly.</p>
      <button onClick={reset} className="mt-5 rounded-md bg-brand text-white px-5 py-2 text-sm font-sans font-bold hover:bg-brand-dark transition">Try again</button>
    </div>
  );
}
