import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderPlaced } from "@/components/OrderPlaced";
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
    <main className="flex flex-1 items-center justify-center">
      <OrderPlaced code={order.code} variant={order.variant} qty={order.qty} total={order.total} />
    </main>
  );
}
