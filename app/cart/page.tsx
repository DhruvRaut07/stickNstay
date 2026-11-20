import type { Metadata } from "next";
import { connection } from "next/server";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getProducts } from "@/lib/catalog";
import { CartView } from "./CartView";

export const metadata: Metadata = { title: "Cart: StickNstay", robots: { index: false } };

export default async function CartPage() {
  await connection(); // always read the live catalog, never a build-time copy
  const products = await getProducts();
  const catalog = products.map(({ slug, name, artBg, artText, artTilt, imageUrl }) => ({
    slug,
    name,
    artBg,
    artText,
    artTilt,
    imageUrl,
  }));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl px-5 py-12">
        <h1 className="headline">Your cart.</h1>
        <CartView catalog={catalog} />
      </main>
      <SiteFooter />
    </>
  );
}
