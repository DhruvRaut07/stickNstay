import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { OrderForm } from "./OrderForm";

export const metadata: Metadata = { title: "Order: StickNstay" };

type Props = { searchParams: Promise<{ variant?: string }> };

export default async function OrderPage({ searchParams }: Props) {
  const { variant } = await searchParams;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl px-5 py-12">
        <h1 className="headline">Place your order.</h1>
        <p className="mt-3 text-muted">
          Batchmates only. We check your BSP number, and you pay cash on delivery.
        </p>
        <OrderForm initialVariant={variant === "basic" ? "basic" : "custom"} />
      </main>
      <SiteFooter />
    </>
  );
}
