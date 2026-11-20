import Link from "next/link";
import { CheckBadge } from "./CheckBadge";
import { Toast } from "./Toast";

type OrderPlacedProps = { code: string; variant: string; qty: number; total: number };

/** "Order placed" screen, shared by /thank-you/[code] and the in-form demo fallback. */
export function OrderPlaced({ code, variant, qty, total }: OrderPlacedProps) {
  const rows = [
    ["Item", `${qty} × ${variant} magnet`],
    ["Size", "5×7 inches"],
    ["Pay on delivery", `₹${total} in cash`],
  ];

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 py-14 text-center">
      {/* Toast: pinned to the viewport so it is visible without scrolling. */}
      <Toast title="Order placed!" detail={`Code ${code}`} />

      <div className="check-pop">
        <CheckBadge />
      </div>
      <h1 className="headline mt-8">Order placed!</h1>
      <p className="mt-3 text-lg text-muted">
        We&apos;ll contact you on your mobile number to arrange the handover.
      </p>

      <section
        aria-label="Order receipt"
        className="mt-10 w-full overflow-hidden rounded-[28px] border border-line bg-surface text-left shadow-[var(--shadow-card)]"
      >
        <div className="bg-accent px-6 py-5 text-center">
          <p className="text-sm font-semibold">Your order code</p>
          <p className="mt-1 text-3xl font-bold tracking-wider">{code}</p>
        </div>
        <dl className="divide-y divide-dashed divide-line">
          {rows.map(([term, value]) => (
            <div key={term} className="flex items-center justify-between gap-4 px-6 py-4">
              <dt className="text-muted">{term}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <p className="mt-4 text-sm text-muted">Save your order code. You&apos;ll need it when we deliver.</p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn press">
          Back to home
        </Link>
        <Link href="/shop" className="btn-ghost press">
          Browse the shop
        </Link>
      </div>
    </div>
  );
}
