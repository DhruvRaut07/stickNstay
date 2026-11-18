import Link from "next/link";
import { Toast } from "./Toast";

type OrderPlacedProps = { code: string; variant: string; qty: number; total: number };

/** "Order placed" screen, shared by /thank-you/[code] and the in-form demo fallback. */
export function OrderPlaced({ code, variant, qty, total }: OrderPlacedProps) {
  const rows = [
    ["Order code", code],
    ["Item", `${qty} × ${variant} magnet (5×7 in)`],
    ["Pay on delivery", `₹${total} in cash`],
  ];

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-5 py-16 text-center">
      {/* Toast: pinned to the viewport so it is visible without scrolling; hides itself via CSS. */}
      <Toast title="Order placed!" detail={`Code ${code}`} />
      <div
        aria-hidden
        className="tilt grid h-20 w-20 place-items-center rounded-full bg-accent text-4xl font-bold text-accent-fg shadow-[var(--shadow-card)]"
      >
        ✓
      </div>
      <h1 className="display mt-8 !text-5xl sm:!text-6xl">Order placed!</h1>
      <p className="mt-4 text-lg text-muted">
        Thank you. We&apos;ll contact you on your mobile number to arrange the handover.
      </p>

      <dl className="mt-10 w-full divide-y divide-line rounded-[28px] border border-line bg-surface text-left shadow-[var(--shadow-card)]">
        {rows.map(([term, value]) => (
          <div key={term} className="flex items-center justify-between gap-4 px-6 py-4">
            <dt className="text-sm text-muted">{term}</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-muted">Save your order code. You&apos;ll need it when we deliver.</p>

      <Link href="/" className="btn-ghost press mt-10">
        Back to home
      </Link>
    </div>
  );
}
