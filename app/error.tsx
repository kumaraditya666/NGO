"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-20 text-center">
      <h1 className="font-editorial text-4xl">Something stumbled</h1>
      <p className="mt-3 text-sm text-forest-muted">No payment details were logged. Please try again.</p>
      <button onClick={reset} className="mt-5 rounded-full bg-forest text-white px-5 py-2 text-sm">Try again</button>
    </div>
  );
}
