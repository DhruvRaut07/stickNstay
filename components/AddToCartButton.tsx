"use client";

import Link from "next/link";
import { useState } from "react";
import { DAILY_LIMIT } from "@/lib/rules";
import { useCart } from "@/lib/use-cart";

type Props = { slug: string; name: string; size?: "card" | "page" };

/** Adds one magnet to the cart. Disabled once the cart holds the daily limit. */
export function AddToCartButton({ slug, name, size = "card" }: Props) {
  const { count, items, add } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = items.find((item) => item.slug === slug)?.qty ?? 0;
  const isFull = count >= DAILY_LIMIT;

  function handleAdd() {
    add(slug);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  }

  const sizing = size === "page" ? "px-8" : "px-4 text-sm";

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleAdd}
        disabled={isFull}
        className={`btn press ${sizing} disabled:opacity-50`}
      >
        {justAdded ? "Added ✓" : "Add to cart"}
        <span className="sr-only"> {name}</span>
      </button>
      <p role="status" className="min-h-5 text-sm text-muted">
        <span className="sr-only">{justAdded ? `${name} added to cart. ${count} in cart.` : ""}</span>
        {isFull && (
          <>
            Cart is full ({DAILY_LIMIT} magnets max).{" "}
            <Link href="/cart" className="font-semibold text-link hover:underline">
              View cart
            </Link>
          </>
        )}
        {!isFull && inCart > 0 && `${inCart} in cart`}
      </p>
    </div>
  );
}
