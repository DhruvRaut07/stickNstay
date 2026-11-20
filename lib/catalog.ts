import "server-only";
import { SLUG_PATTERN } from "./cart";
import { supabaseAdmin } from "./supabase";

export type Category = { slug: string; name: string };

export type Product = {
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  artBg: string;
  artText: string;
  artTilt: string;
  imageUrl: string | null;
};

type ProductRow = {
  slug: string;
  name: string;
  description: string;
  category_slug: string;
  art_bg: string;
  art_text: string;
  art_tilt: string;
  image_url: string | null;
  categories: { name: string } | null;
};

const COLUMNS =
  "slug, name, description, category_slug, art_bg, art_text, art_tilt, image_url, categories(name)";

const toProduct = (row: ProductRow): Product => ({
  slug: row.slug,
  name: row.name,
  description: row.description,
  categorySlug: row.category_slug,
  categoryName: row.categories?.name ?? "",
  artBg: row.art_bg,
  artText: row.art_text,
  artTilt: row.art_tilt,
  imageUrl: row.image_url,
});

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin()
    .from("categories")
    .select("slug, name")
    .order("sort");
  if (error) throw new Error(`Could not load categories: ${error.message}`);
  return data ?? [];
}

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  let query = supabaseAdmin().from("products").select(COLUMNS).eq("active", true).order("sort");
  if (categorySlug && SLUG_PATTERN.test(categorySlug)) query = query.eq("category_slug", categorySlug);
  const { data, error } = await query.returns<ProductRow[]>();
  if (error) throw new Error(`Could not load products: ${error.message}`);
  return (data ?? []).map(toProduct);
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (!SLUG_PATTERN.test(slug)) return null;
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select(COLUMNS)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle<ProductRow>();
  if (error) throw new Error(`Could not load product: ${error.message}`);
  return data ? toProduct(data) : null;
}

export async function getProductsBySlugs(slugs: readonly string[]): Promise<Product[]> {
  const valid = slugs.filter((slug) => SLUG_PATTERN.test(slug));
  if (valid.length === 0) return [];
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select(COLUMNS)
    .eq("active", true)
    .in("slug", valid)
    .returns<ProductRow[]>();
  if (error) throw new Error(`Could not load products: ${error.message}`);
  return (data ?? []).map(toProduct);
}
