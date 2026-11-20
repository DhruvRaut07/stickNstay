"use client";

import Link from "next/link";
import { Magnet } from "@/components/Magnet";
import { Sticker } from "@/components/Sticker";
import type { Product } from "@/lib/catalog";
import { DAILY_LIMIT } from "@/lib/rules";
import { useCart } from "@/lib/use-cart";

export type CartProduct = Pick<Product, "slug" | "name" | "artBg" | "artText" | "artTilt" | "imageUrl">;

/** Cart contents. Reads the browser cart and matches it against the catalog passed from the server. */
export function CartView({ catalog, price }: { catalog: readonly CartProduct[]; price: number }) {
  const { ready, items, count, setQuantity, remove } = useCart();
  const bySlug = new Map(catalog.map((p) => [p.slug, p]));
  const total = items.reduce((sum, item) => sum + (bySlug.has(item.slug) ? item.qty * price : 0), 0);
  const hasUnavailable = items.some((item) => !bySlug.has(item.slug));

  if (!ready) {
    return (
      <p role="status" className="py-20 text-center text-muted">
        Loading your cart…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <Sticker name="06-gen-z-and-funny/snacks-first" tilt={-3} className="mb-6 w-48" />
        <p className="text-xl font-semibold">Your cart is empty.</p>
        <p className="mt-2 text-muted">Pick a few magnets and they&apos;ll show up here.</p>
        <Link href="/shop" className="btn press mt-8">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <ul className="space-y-4">
        {items.map((item) => {
          const product = bySlug.get(item.slug);
          return (
            <li
              key={item.slug}
              className="flex items-center gap-4 rounded-[28px] border border-line bg-surface p-4 shadow-[var(--shadow-card)]"
            >
              <div className="w-20 shrink-0">
                {product ? (
                  <Magnet
                    tilt="0deg"
                    bg={product.artBg}
                    text={product.artText}
                    imageUrl={product.imageUrl}
                    sizes="80px"
                    label={`${product.name} magnet design`}
                  />
                ) : (
                  <div className="aspect-[5/7] rounded-2xl border border-dashed border-line" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{product ? product.name : "No longer available"}</p>
                {product && <p className="text-sm text-muted">₹{price} each</p>}
                <button
                  type="button"
                  onClick={() => remove(item.slug)}
                  className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-link hover:underline"
                >
                  Remove
                </button>
              </div>
              {product && (
                <div className="text-right">
                  <label className="sr-only" htmlFor={`qty-${item.slug}`}>
                    Quantity for {product.name}
                  </label>
                  <select
                    id={`qty-${item.slug}`}
                    value={item.qty}
                    onChange={(e) => setQuantity(item.slug, Number(e.target.value))}
                    className="min-h-11 rounded-2xl border border-line bg-surface px-3"
                  >
                    {Array.from({ length: DAILY_LIMIT }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n} disabled={n > item.qty + (DAILY_LIMIT - count)}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 font-semibold">₹{item.qty * price}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {hasUnavailable && (
        <p role="alert" className="mt-4 rounded-2xl bg-magnet/10 p-4 text-sm font-medium text-link">
          Some designs are no longer available. Remove them to continue.
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <div>
          <p className="text-sm text-muted">
            {count} of {DAILY_LIMIT} magnets · cash on delivery
          </p>
          <p className="text-3xl font-bold tracking-tight">₹{total}</p>
        </div>
        {hasUnavailable ? (
          <span className="btn opacity-50" aria-disabled="true">
            Checkout
          </span>
        ) : (
          <Link href="/checkout" className="btn press px-8">
            Checkout
          </Link>
        )}
      </div>
    </div>
  );
}
