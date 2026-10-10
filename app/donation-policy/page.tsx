export const metadata = { title: "Donation & refund policy (draft)" };
export default function Policy() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="text-xs uppercase tracking-widest text-terracotta font-semibold">Draft — requires client review before launch</p>
      <h1 className="font-editorial text-4xl mt-2">Donation & refund policy (draft)</h1>
      <div className="mt-4 text-sm leading-relaxed space-y-3">
        <p>Donations are made externally by UPI/bank transfer and confirmed only after staff verify the bank credit. If you paid but we cannot trace it, contact us with date, amount and UTR — we will investigate.</p>
        <p>Refunds: if a credit cannot be matched or was made in error, write within 7 days with proof. Approved refunds go to the source account. Replace with client-approved policy.</p>
        <p>Acknowledgements issued here are not tax certificates. Any tax wording must be separately supplied and approved.</p>
      </div>
    </div>
  );
}
