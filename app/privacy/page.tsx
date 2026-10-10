export const metadata = { title: "Privacy notice" };
export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 font-sans">
      <h1 className="font-sans font-extrabold text-ink text-4xl mt-2">Privacy notice</h1>
      <div className="mt-4 text-[15px] leading-relaxed text-slate-600 space-y-3">
        <p>We collect only what our forms ask for: your name, a way to reach you, and whatever you choose to tell us. Volunteer applications, pledges, messages and event registrations are stored for staff review and never published.</p>
        <p>Payment proofs, where submitted, are visible only to authorised staff and never appear publicly. Donor emails, phone numbers and payment references are never exposed on the website.</p>
        <p>Write to us if you want your details corrected or removed, and we will act on it.</p>
      </div>
    </div>
  );
}
