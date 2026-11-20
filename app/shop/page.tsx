import type { Metadata } from "next";
import Link from "next/link";
import { CustomMagnetCard } from "@/components/CustomMagnetCard";
import { PageHero } from "@/components/PageHero";
import { ProductCard } from "@/components/ProductCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getCategories, getProducts } from "@/lib/catalog";
import { DAILY_LIMIT, PRICES } from "@/lib/rules";

export const metadata: Metadata = {
  title: "Shop: StickNstay",
  description: "Browse ready-made 5×7 inch magnet designs by category, or make your own custom magnet.",
};

type Props = { searchParams: Promise<{ category?: string }> };

const chip = "inline-flex min-h-11 items-center rounded-full border-2 px-5 font-semibold transition";

export default async function ShopPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const categories = await getCategories();
  const active = categories.find((c) => c.slug === category);
  const products = await getProducts(active?.slug);

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero eyebrow="Shop" title="Pick your magnet.">
          Ready-made 5×7 inch magnets at ₹{PRICES.basic} each. Up to {DAILY_LIMIT} per student per day.
        </PageHero>

        <section className="mx-auto max-w-5xl px-5 py-16">
          <nav aria-label="Categories" className="flex flex-wrap gap-3">
            <Link
              href="/shop"
              aria-current={active ? undefined : "page"}
              className={`${chip} ${active ? "border-line bg-surface" : "border-fg bg-accent"}`}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?category=${c.slug}`}
                aria-current={active?.slug === c.slug ? "page" : undefined}
                className={`${chip} ${active?.slug === c.slug ? "border-fg bg-accent" : "border-line bg-surface"}`}
              >
                {c.name}
              </Link>
            ))}
          </nav>

          {products.length === 0 && active ? (
            <p className="py-20 text-center text-muted">No designs here yet. Check back soon.</p>
          ) : (
            <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
              {!active && <CustomMagnetCard />}
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
