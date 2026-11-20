import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { requireStudent } from "@/lib/session";
import { getPrices } from "@/lib/settings";
import { OrderForm } from "./OrderForm";

export const metadata: Metadata = { title: "Order: StickNstay" };

type Props = { searchParams: Promise<{ variant?: string }> };

export default async function OrderPage({ searchParams }: Props) {
  const { variant } = await searchParams;
  const initialVariant = variant === "basic" ? "basic" : "custom";
  const student = await requireStudent(`/order?variant=${initialVariant}`);
  const prices = await getPrices();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl px-5 py-12">
        <h1 className="headline">Place your order.</h1>
        <p className="mt-3 text-muted">IBS Mumbai students only. You pay cash on delivery.</p>
        <OrderForm initialVariant={initialVariant} student={student} prices={prices} />
      </main>
      <SiteFooter />
    </>
  );
}
