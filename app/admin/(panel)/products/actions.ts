"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PG, adminRedirect, firstIssue, productSchema } from "@/lib/admin-schemas";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase";

const back = (formData: FormData, message: string) =>
  redirect(adminRedirect(formData.get("back"), message, "/admin/products"));

const refresh = () => {
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
};

function readProduct(formData: FormData) {
  return productSchema.safeParse(Object.fromEntries(formData));
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const parsed = readProduct(formData);
  if (!parsed.success) return back(formData, firstIssue(parsed.error));

  const { image_url, ...rest } = parsed.data;
  const { error } = await supabaseAdmin()
    .from("products")
    .insert({ ...rest, image_url: image_url ?? null, art_bg: "var(--sns-cream)", art_text: "var(--sns-ink)" });
  if (error) {
    console.error("createProduct failed", error);
    if (error.code === PG.unique) return back(formData, "A product with that slug already exists.");
    if (error.code === PG.foreignKey) return back(formData, "Pick a valid category.");
    return back(formData, "Couldn't add that product. Please try again.");
  }
  refresh();
  return back(formData, `Added ${parsed.data.name}.`);
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const parsed = readProduct(formData);
  if (!parsed.success) return back(formData, firstIssue(parsed.error));

  const { slug, image_url, ...fields } = parsed.data;
  const { data, error } = await supabaseAdmin()
    .from("products")
    .update({ ...fields, image_url: image_url ?? null })
    .eq("slug", slug)
    .select("slug");
  if (error) {
    console.error("updateProduct failed", error);
    if (error.code === PG.foreignKey) return back(formData, "Pick a valid category.");
    return back(formData, "Couldn't save that product. Please try again.");
  }
  if (!data?.length) return back(formData, "That product no longer exists.");
  refresh();
  return back(formData, `Saved ${parsed.data.name}.`);
}
