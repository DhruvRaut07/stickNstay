import type { Metadata } from "next";
import Image from "next/image";
import { card, ErrorNote, FlashMessage, PageHeader, Pill } from "@/components/admin/ui";
import { Pagination } from "@/components/Pagination";
import { paginate, parsePage } from "@/lib/pagination";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase";
import { createProduct, updateProduct } from "./actions";

export const metadata: Metadata = { title: "Products: StickNstay admin", robots: { index: false } };

type Product = {
  slug: string;
  name: string;
  description: string;
  category_slug: string;
  image_url: string | null;
  sort: number;
  active: boolean;
};
type Category = { slug: string; name: string };
type Props = { searchParams: Promise<{ q?: string; category?: string; msg?: string; page?: string }> };

const PAGE_SIZE = 20;

const field =
  "min-h-11 rounded-2xl border border-line bg-surface px-3 py-2 text-sm placeholder:text-muted focus:border-fg";
const SLUG = /^[a-z0-9-]{1,60}$/;

function ProductFields({ product, categories }: { product?: Product; categories: Category[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-medium">
        Slug (cannot change later)
        <input
          name="slug"
          defaultValue={product?.slug}
          readOnly={Boolean(product)}
          required
          className={`${field} mt-1 w-full ${product ? "bg-paper" : ""}`}
        />
      </label>
      <label className="text-sm font-medium">
        Name
        <input name="name" defaultValue={product?.name} required maxLength={80} className={`${field} mt-1 w-full`} />
      </label>
      <label className="text-sm font-medium sm:col-span-2">
        Description
        <textarea
          name="description"
          defaultValue={product?.description}
          required
          rows={3}
          maxLength={300}
          className={`${field} mt-1 w-full`}
        />
      </label>
      <label className="text-sm font-medium">
        Category
        <select name="category_slug" defaultValue={product?.category_slug} required className={`${field} mt-1 w-full`}>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        Image path (file must exist in public/stickers)
        <input
          name="image_url"
          defaultValue={product?.image_url ?? ""}
          placeholder="/stickers/06-gen-z-and-funny/snacks-first.webp"
          className={`${field} mt-1 w-full`}
        />
      </label>
      <label className="text-sm font-medium">
        Sort (lower shows first)
        <input
          name="sort"
          type="number"
          min={0}
          max={9999}
          defaultValue={product?.sort ?? 0}
          required
          className={`${field} mt-1 w-full`}
        />
      </label>
      <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
        <input name="active" type="checkbox" defaultChecked={product?.active ?? true} className="size-5" />
        Visible in the shop
      </label>
    </div>
  );
}

export default async function AdminProductsPage({ searchParams }: Props) {
  await requireAdmin();
  const { q, category, msg, page: rawPage } = await searchParams;
  const db = supabaseAdmin();

  const [productsRes, categoriesRes] = await Promise.all([
    db.from("products").select("slug, name, description, category_slug, image_url, sort, active").order("sort").limit(500).returns<Product[]>(),
    db.from("categories").select("slug, name").order("sort").returns<Category[]>(),
  ]);
  if (productsRes.error) console.error("Admin products load failed", productsRes.error);
  if (categoriesRes.error) console.error("Admin categories load failed", categoriesRes.error);

  const categories = categoriesRes.data ?? [];
  const term = (q ?? "").trim().toLowerCase().slice(0, 40);
  const activeCategory = SLUG.test(category ?? "") ? category : undefined;
  const matches = (productsRes.data ?? []).filter(
    (p) =>
      (!activeCategory || p.category_slug === activeCategory) &&
      (!term || p.name.toLowerCase().includes(term) || p.slug.includes(term)),
  );
  const paged = paginate(matches, parsePage(rawPage), PAGE_SIZE);
  const products = paged.items;
  const filters = { ...(term && { q: term }), ...(activeCategory && { category: activeCategory }) };
  const back = `/admin/products?${new URLSearchParams({ ...filters, ...(paged.page > 1 && { page: String(paged.page) }) })}`;
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));

  return (
    <>
      <PageHeader title="Products" description="Add designs, edit copy, or hide them from the shop." />

      <FlashMessage message={msg} />
      {(productsRes.error || categoriesRes.error) && (
        <ErrorNote>Couldn&apos;t load {productsRes.error ? "products" : "categories"}. Check the Vercel logs.</ErrorNote>
      )}

      <form className={`${card} flex flex-wrap gap-3 p-4`} role="search">
        <input name="q" defaultValue={term} placeholder="Search name or slug" className={`${field} min-w-56 flex-1`} />
        <select name="category" defaultValue={activeCategory ?? ""} className={field} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="btn press text-sm">Filter</button>
      </form>

      <details className={`${card} p-5`}>
        <summary className="cursor-pointer text-lg font-bold">Add a product</summary>
        <form action={createProduct} className="mt-4 space-y-4">
          <input type="hidden" name="back" value={back} />
          <ProductFields categories={categories} />
          <button className="btn press text-sm">Add product</button>
        </form>
      </details>

      <p className="text-sm text-muted">
        {paged.total} product{paged.total === 1 ? "" : "s"}
      </p>
      <ul className="space-y-3">
        {products.length === 0 && !productsRes.error && (
          <li className={`${card} py-12 text-center text-muted`}>No products match.</li>
        )}
        {products.map((p) => (
          <li key={p.slug} className={card}>
            <details>
              <summary className="flex cursor-pointer list-none items-center gap-4 p-4 [&::-webkit-details-marker]:hidden">
                {p.image_url ? (
                  <Image src={p.image_url} alt="" width={56} height={56} sizes="56px" className="size-14 shrink-0 object-contain" />
                ) : (
                  <span className="size-14 shrink-0 rounded-2xl border border-dashed border-line" aria-hidden="true" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{p.name}</span>
                  <span className="block text-sm text-muted">
                    {categoryName.get(p.category_slug) ?? p.category_slug} · sort {p.sort}
                  </span>
                </span>
                <Pill tone={p.active ? "new" : "neutral"}>{p.active ? "Visible" : "Hidden"}</Pill>
              </summary>
              <form action={updateProduct} className="space-y-4 border-t border-line p-5">
                <input type="hidden" name="back" value={back} />
                <ProductFields product={p} categories={categories} />
                <button className="btn press text-sm">Save changes</button>
              </form>
            </details>
          </li>
        ))}
      </ul>

      <Pagination page={paged.page} pages={paged.pages} total={paged.total} size={PAGE_SIZE} basePath="/admin/products" params={filters} />
    </>
  );
}
