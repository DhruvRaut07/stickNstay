import type { Metadata } from "next";
import Link from "next/link";
import { CustomMagnetCard } from "@/components/CustomMagnetCard";
import { PageHero } from "@/components/PageHero";
import { Pagination } from "@/components/Pagination";
import { ProductCard } from "@/components/ProductCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getCategories, getProducts, type Product } from "@/lib/catalog";
import { paginate, parsePage } from "@/lib/pagination";
import { DAILY_LIMIT } from "@/lib/rules";
import { getPrices } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Shop: StickNstay",
  description: "Browse ready-made 5×7 inch magnet designs by category, or make your own custom magnet.",
};

type Props = { searchParams: Promise<{ category?: string; page?: string }> };

// 12 cells = 3 rows of 4. The "make your own" card takes the first cell of "All", so it counts too.
const PAGE_SIZE = 12;
type Cell = Product | "custom";

// Cover sticker per category slug. Categories without an entry get no tile.
const COVERS: Record<string, string> = {
  aesthetic: "/stickers/05-self-love-and-good-vibes/glow-from-within.webp",
  "campus-life": "/stickers/04-study-mode/focus-mode-on.webp",
  "vibes-quotes": "/stickers/01-motivation/dream-big-start-small.webp",
  "doodles-fun": "/stickers/06-gen-z-and-funny/snacks-first.webp",
};

const chip ="inline-flex min-h-11 items-center rounded-full border-2 px-5 font-semibold transition";

export default async function ShopPage({ searchParams }: Props) {
  const { category, page: rawPage } = await searchParams;
  // One round trip: the catalog is small (56 rows), so filter by category in memory.
  const [categories, all, prices] = await Promise.all([getCategories(), getProducts(), getPrices()]);
  const active = categories.find((c) => c.slug === category);
  const products = active ? all.filter((p) => p.categorySlug === active.slug) : all;
  const cells: Cell[] = active ? products : ["custom", ...products];
  const paged = paginate(cells, parsePage(rawPage), PAGE_SIZE);

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Shop"
          title="Pick your magnet."
          stickers={["01-motivation/start-before-ready", "06-gen-z-and-funny/no-thoughts-just-vibes"]}
        >
          Ready-made 5×7 inch magnets at ₹{prices.basic} each. Up to {DAILY_LIMIT} per student per day.
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

          {!active && paged.page === 1 && (
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
            <>
              <ul id="designs" className="mt-12 grid scroll-mt-24 grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
                {paged.items.map((cell) =>
                  cell === "custom" ? (
                    <CustomMagnetCard key="custom" price={prices.custom} />
                  ) : (
                    <ProductCard key={cell.slug} product={cell} price={prices.basic} />
                  ),
                )}
              </ul>
              <div className="mt-14">
                <Pagination
                  page={paged.page}
                  pages={paged.pages}
                  total={paged.total}
                  size={PAGE_SIZE}
                  basePath="/shop"
                  params={{ category: active?.slug }}
                  anchor="designs"
                />
              </div>
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
