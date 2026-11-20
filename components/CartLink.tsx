"use client";

import Link from "next/link";
import { useCart } from "@/lib/use-cart";

/** Header cart link: icon only on phones, icon + label from sm, with a live item count. */
export function CartLink() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={count ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart"}
      className="press relative inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border-2 border-fg px-2.5 font-semibold transition hover:bg-fg hover:text-accent sm:px-5"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" />
        <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
      </svg>
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-link px-1.5 text-xs font-bold text-white sm:static sm:min-w-6"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
