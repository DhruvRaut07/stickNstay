import type { Metadata } from "next";
import { connection } from "next/server";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getProducts } from "@/lib/catalog";
import { requireStudent } from "@/lib/session";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "Checkout: StickNstay", robots: { index: false } };

export default async function CheckoutPage() {
  await connection(); // per-visitor page: never prerender it
  const student = await requireStudent("/checkout");
  const products = await getProducts();
  const catalog = products.map(({ slug, name }) => ({ slug, name }));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl px-5 py-12">
        <h1 className="headline">Checkout.</h1>
        <p className="mt-3 text-muted">IBS Mumbai students only. You pay cash on delivery.</p>
        <CheckoutForm student={student} catalog={catalog} />
      </main>
      <SiteFooter />
    </>
  );
}
