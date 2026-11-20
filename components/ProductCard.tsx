import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { AddToCartButton } from "./AddToCartButton";
import { Magnet } from "./Magnet";

/** Shop grid tile: art, name, category, price and an add-to-cart button. */
export function ProductCard({ product, price }: { product: Product; price: number }) {
  return (
    <li className="flex flex-col">
      <Link
        href={`/shop/${product.slug}`}
        aria-label={`${product.name}, ₹${price}`}
        tabIndex={-1}
        className="press block"
      >
        <Magnet
          tilt="0deg"
          bg={product.artBg}
          text={product.artText}
          imageUrl={product.imageUrl}
          label={`${product.name} magnet design`}
        />
      </Link>
      <div className="mt-4 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{product.categoryName}</p>
        <h3 className="mt-1 text-base font-semibold leading-snug">
          <Link href={`/shop/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-[15px] text-muted">
          <span className="font-semibold text-fg">₹{price}</span> · 5×7 inch
        </p>
      </div>
      <div className="mt-3">
        <AddToCartButton slug={product.slug} name={product.name} />
      </div>
    </li>
  );
}
