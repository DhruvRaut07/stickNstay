import { z } from "zod";
import { DAILY_LIMIT, orderSchema } from "./rules";

export type CartItem = { slug: string; qty: number };

export const SLUG_PATTERN = /^[a-z0-9-]{1,60}$/;

const cartItemSchema = z.object({
  slug: z.string().regex(SLUG_PATTERN),
  qty: z.number().int().min(1).max(DAILY_LIMIT),
});

export const cartCount = (items: readonly CartItem[]): number =>
  items.reduce((sum, item) => sum + item.qty, 0);

/** Adds one magnet. Returns the same array when the daily limit is already reached. */
export function addItem(items: readonly CartItem[], slug: string): readonly CartItem[] {
  if (cartCount(items) >= DAILY_LIMIT) return items;
  const existing = items.find((item) => item.slug === slug);
  return existing
    ? items.map((item) => (item.slug === slug ? { ...item, qty: item.qty + 1 } : item))
    : [...items, { slug, qty: 1 }];
}

export const removeItem = (items: readonly CartItem[], slug: string): readonly CartItem[] =>
  items.filter((item) => item.slug !== slug);

/** Sets a quantity, clamped so the whole cart never exceeds the daily limit. */
export function setQty(items: readonly CartItem[], slug: string, qty: number): readonly CartItem[] {
  if (qty <= 0) return removeItem(items, slug);
  const others = cartCount(items.filter((item) => item.slug !== slug));
  const clamped = Math.min(Math.floor(qty), DAILY_LIMIT - others);
  if (clamped <= 0) return removeItem(items, slug);
  return items.map((item) => (item.slug === slug ? { ...item, qty: clamped } : item));
}

/** Reads the stored cart. Anything missing, corrupt or tampered with becomes an empty cart. */
export function parseCart(raw: string | null): readonly CartItem[] {
  if (!raw) return [];
  try {
    const parsed = z.array(cartItemSchema).max(DAILY_LIMIT).safeParse(JSON.parse(raw));
    if (!parsed.success || cartCount(parsed.data) > DAILY_LIMIT) return [];
    return parsed.data;
  } catch {
    return [];
  }
}

const checkoutItems = z
  .array(cartItemSchema)
  .min(1, "Your cart is empty")
  .max(DAILY_LIMIT)
  .refine((items) => cartCount(items) <= DAILY_LIMIT, `Daily limit is ${DAILY_LIMIT} magnets`)
  .refine(
    (items) => new Set(items.map((item) => item.slug)).size === items.length,
    "Each design can appear only once",
  );

export const checkoutSchema = orderSchema
  .omit({ variant: true, qty: true })
  .extend({ items: checkoutItems });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
