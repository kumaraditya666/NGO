export const metadata = { title: "Donation & refund policy" };
export default function Policy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 font-sans">
      <h1 className="font-sans font-extrabold text-slate-900 text-4xl mt-2">Donation &amp; refund policy</h1>
      <div className="mt-4 text-[15px] leading-relaxed text-slate-600 space-y-3">
        <p>Online donations are currently closed while the NGO&apos;s bank account is being opened. No payment details appear on this website, and no money is accepted through it.</p>
        <p>When donations open, gifts will be made by UPI or bank transfer and confirmed only after staff verify the bank credit. If a payment cannot be traced, contact the team with the date, amount and reference, and it will be investigated.</p>
        <p>Refunds, if ever needed, will be decided case by case and returned to the source account. No tax deduction is promised; acknowledgements are not tax certificates.</p>
      </div>
    </div>
  );
}
