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

// Cover sticker per category slug. Categories without an entry get no tile.
const COVERS: Record<string, string> = {
  aesthetic: "/stickers/05-self-love-and-good-vibes/glow-from-within.webp",
  "campus-life": "/stickers/04-study-mode/focus-mode-on.webp",
  "vibes-quotes": "/stickers/01-motivation/dream-big-start-small.webp",
  "doodles-fun": "/stickers/06-gen-z-and-funny/snacks-first.webp",
};

const chip ="inline-flex min-h-11 items-center rounded-full border-2 px-5 font-semibold transition";

export default async function ShopPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const categories = await getCategories();
  const active = categories.find((c) => c.slug === category);
  const products = await getProducts(active?.slug);

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Shop"
          title="Pick your magnet."
          stickers={["01-motivation/start-before-ready", "06-gen-z-and-funny/no-thoughts-just-vibes"]}
        >
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

          {!active && (
            <ul className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
              {categories
                .filter((c) => COVERS[c.slug])
                .map((c, i) => (
                  <li key={c.slug}>
                    <Link
                      href={`/shop?category=${c.slug}`}
                      className="press flex h-full flex-col items-center rounded-[28px] border border-line bg-paper p-4 shadow-[var(--shadow-card)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={COVERS[c.slug]}
                        alt=""
                        width={800}
                        height={800}
                        loading="lazy"
                        className="aspect-square w-full object-contain"
                        style={{ transform: `rotate(${i % 2 ? 4 : -4}deg)` }}
                      />
                      <span className="mt-3 font-semibold">{c.name}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          )}

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
