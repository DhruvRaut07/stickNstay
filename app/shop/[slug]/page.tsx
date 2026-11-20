import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Magnet } from "@/components/Magnet";
import { ProductCard } from "@/components/ProductCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getProduct, getProducts } from "@/lib/catalog";
import { DAILY_LIMIT, PRICES } from "@/lib/rules";

type Props = { params: Promise<{ slug: string }> };

const DETAILS = [
  ["Size", "5×7 inches"],
  ["Type", "Magnet sticker, sticks to fridge, locker, cupboard or whiteboard"],
  ["Payment", "Cash on delivery"],
  ["Delivery", "Hand-delivered on IBS Mumbai campus"],
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Not found: StickNstay" };
  return { title: `${product.name}: StickNstay`, description: product.description };
}

export default async function ProductPage({ params }: Props) {
  await connection(); // always read the live catalog, never a build-time copy
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = (await getProducts(product.categorySlug)).filter((p) => p.slug !== product.slug);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/shop" className="hover:underline">
            Shop
          </Link>
          {" / "}
          <Link href={`/shop?category=${product.categorySlug}`} className="hover:underline">
            {product.categoryName}
          </Link>
        </nav>

        <div className="mt-8 grid gap-12 md:grid-cols-2">
          <div className="mx-auto w-full max-w-sm">
            <Magnet
              tilt="0deg"
              bg={product.artBg}
              text={product.artText}
              imageUrl={product.imageUrl}
              sizes="(min-width: 384px) 384px, 100vw"
              label={`${product.name} magnet design`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-muted">{product.categoryName}</p>
            <h1 className="headline mt-1">{product.name}</h1>
            <p className="mt-4 text-3xl font-bold tracking-tight">₹{PRICES.basic}</p>
            <p className="mt-4 text-lg">{product.description}</p>

            <div className="mt-8">
              <AddToCartButton slug={product.slug} name={product.name} size="page" />
              <Link href="/cart" className="mt-2 inline-flex min-h-11 items-center font-semibold text-link hover:underline">
                Go to cart ›
              </Link>
              <p className="mt-2 text-sm text-muted">Up to {DAILY_LIMIT} magnets per student per day.</p>
            </div>

            <dl className="mt-10 divide-y divide-dashed divide-line rounded-[28px] border border-line bg-surface shadow-[var(--shadow-card)]">
              {DETAILS.map(([term, value]) => (
                <div key={term} className="flex gap-4 px-6 py-4">
                  <dt className="w-24 shrink-0 text-muted">{term}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-20">
            <h2 id="related-heading" className="text-2xl font-bold">
              More in {product.categoryName}
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
              {related.slice(0, 4).map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </ul>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
