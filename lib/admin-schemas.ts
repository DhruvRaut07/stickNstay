import { z } from "zod";

const SLUG = /^[a-z0-9-]{1,60}$/;
// Product art lives in public/ (next/image only serves local files), so only local sticker paths are allowed.
const IMAGE_PATH = /^\/stickers\/[a-z0-9-]+\/[a-z0-9-]+\.(webp|png|jpg)$/;

const blankToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

/** Fields an admin can set on a product. `active` is a checkbox: present = on. */
export const productSchema = z.object({
  slug: z.string().trim().regex(SLUG, "Slug: lowercase letters, numbers and dashes only"),
  name: z.string().trim().min(2, "Name is too short").max(80, "Name is too long"),
  description: z.string().trim().min(10, "Description needs at least 10 characters").max(300, "Description is too long"),
  category_slug: z.string().trim().regex(SLUG, "Pick a category"),
  image_url: z.preprocess(
    blankToUndefined,
    z.string().trim().regex(IMAGE_PATH, "Image must look like /stickers/genre/name.webp").optional(),
  ),
  sort: z.coerce.number().int("Sort must be a whole number").min(0).max(9999),
  active: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
});

export type ProductInput = z.infer<typeof productSchema>;

/** First human-readable message from a failed parse. */
export const firstIssue = (error: z.ZodError): string => error.issues[0]?.message ?? "Invalid input";

// Only paths inside /admin may be used as a post-action redirect target (blocks open redirects).
const ADMIN_PATH = /^\/admin(\/[a-z]+)?(\?[A-Za-z0-9=&%._+*~-]*)?$/;

/** Cleans admin search text and builds a PostgREST or() filter. Values are double-quoted, so `.` `@` `,` `(` are safe. */
export const searchTerm = (raw: unknown): string =>
  String(raw ?? "").replace(/[%*\\"]/g, "").trim().slice(0, 40);

export const orIlike = (columns: readonly string[], term: string): string =>
  columns.map((c) => `${c}.ilike."%${term}%"`).join(",");

/** `path` when it is a safe /admin path, else `fallback`. Use for any redirect target that came from the client. */
export const safeAdminPath = (path: unknown, fallback = "/admin"): string =>
  typeof path === "string" && ADMIN_PATH.test(path) ? path : fallback;

/** Returns `path` with `msg` appended, or falls back to `fallback` when `path` is not an admin path. */
export function adminRedirect(path: unknown, message: string, fallback = "/admin"): string {
  const base = safeAdminPath(path, fallback);
  const params = base.includes("?") ? "&" : "?";
  return `${base}${params}msg=${encodeURIComponent(message)}`;
}

/** Postgres error codes we turn into friendly text. */
export const PG = { unique: "23505", foreignKey: "23503" } as const;
