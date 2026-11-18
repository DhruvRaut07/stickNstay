import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";

export const metadata: Metadata = { title: "Thank you: StickNstay", robots: { index: false } };

const CODE_PATTERN = /^SNS-[A-F0-9]{8}$/;

export default async function ThankYouPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!CODE_PATTERN.test(code)) notFound();

  // Only non-personal fields are read: the unguessable code is the only "key" here.
  const { data: order } = await supabaseAdmin()
    .from("orders")
    .select("code, variant, qty, total")
    .eq("code", code)
    .maybeSingle();
  if (!order) notFound();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-20 text-center">
      <div
        aria-hidden
        className="tilt grid h-20 w-20 place-items-center rounded-full bg-accent text-4xl font-bold text-accent-fg shadow-[var(--shadow-card)]"
      >
        ✓
      </div>
      <h1 className="display mt-8 !text-5xl sm:!text-6xl">Thank you.</h1>
      <p className="mt-4 text-lg text-muted">
        Your order is in. We&apos;ll contact you on your mobile number to arrange the handover.
      </p>

      <dl className="mt-10 w-full divide-y divide-line rounded-[28px] border border-line bg-surface text-left shadow-[var(--shadow-card)]">
        {[
          ["Order code", order.code],
          ["Item", `${order.qty} × ${order.variant} magnet (5×7 in)`],
          ["Pay on delivery", `₹${order.total} in cash`],
        ].map(([term, value]) => (
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
    </main>
  );
}
