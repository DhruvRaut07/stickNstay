import { z } from "zod";

export type Prices = { basic: number; custom: number };

// Fallback only. The database `settings` table is the source of truth (see lib/settings.ts).
export const DEFAULT_PRICES: Prices = { basic: 30, custom: 40 };

const MAX_PRICE = 9999;
const validPrice = (n: unknown): n is number => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= MAX_PRICE;

/** Prices from `settings` rows. A missing or invalid row keeps its default instead of showing a wrong price. */
export function parsePrices(rows: readonly { key: string; value: unknown }[] | null | undefined): Prices {
  const find = (key: string) => rows?.find((r) => r.key === key)?.value;
  const basic = find("price_basic");
  const custom = find("price_custom");
  return {
    basic: validPrice(basic) ? basic : DEFAULT_PRICES.basic,
    custom: validPrice(custom) ? custom : DEFAULT_PRICES.custom,
  };
}
export const DAILY_LIMIT = 5;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const VARIANTS = ["basic", "custom"] as const;
export type Variant = (typeof VARIANTS)[number];

export const normalizeBsp = (raw: string): string =>
  raw.replace(/\s+/g, "").toUpperCase();

export function normalizeMobile(raw: string): string {
  const digits = raw.replace(/[\s()-]/g, "").replace(/^\+/, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export const orderSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  mobile: z
    .string()
    .transform(normalizeMobile)
    .refine((m) => /^[6-9]\d{9}$/.test(m), "Enter a valid 10-digit mobile number"),
  bsp: z
    .string()
    .transform(normalizeBsp)
    .refine((b) => /^[A-Z0-9/_-]{3,24}$/.test(b), "Enter a valid BSP number"),
  email: z
    .union([z.literal(""), z.email("Enter a valid email")])
    .optional()
    .transform((v) => v || undefined),
  variant: z.enum(VARIANTS),
  qty: z.coerce.number().int().min(1).max(DAILY_LIMIT),
  note: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => v || undefined),
});

export type OrderInput = z.infer<typeof orderSchema>;

const startsWith = (b: Uint8Array, sig: number[], at = 0) =>
  sig.every((v, i) => b[at + i] === v);

/** Detect by magic bytes, never by filename or client-reported MIME type. */
export function detectImageType(b: Uint8Array): "jpg" | "png" | "webp" | null {
  if (startsWith(b, [0xff, 0xd8, 0xff])) return "jpg";
  if (startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (startsWith(b, [0x52, 0x49, 0x46, 0x46]) && startsWith(b, [0x57, 0x45, 0x42, 0x50], 8))
    return "webp";
  return null;
}
