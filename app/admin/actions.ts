"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminRedirect, safeAdminPath } from "@/lib/admin-schemas";
import { rateLimit } from "@/lib/rate-limit";
import { normalizeBsp } from "@/lib/rules";
import { getAdmin, requireAdmin, supabaseAdmin, supabaseAuth } from "@/lib/supabase";

const CHUNK = 500;
const BSP_PATTERN = /^[A-Z0-9/_-]{3,24}$/;
const STATUSES = ["new", "confirmed", "delivered", "cancelled"] as const;

export async function login(formData: FormData) {
  // Return to the page the admin was trying to open (only ever a safe /admin path).
  const next = safeAdminPath(formData.get("next"));
  const fail = (error: string) =>
    redirect(`/admin/login?error=${error}${next === "/admin" ? "" : `&next=${encodeURIComponent(next)}`}`);

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`login:${ip}`, 8, 10 * 60_000)) return fail("rate");

  const parsed = z
    .object({ email: z.email(), password: z.string().min(1).max(200) })
    .safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return fail("1");

  const supabase = await supabaseAuth();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // A valid Supabase user who is not in `admins` must not get in.
  if (error || !(await getAdmin())) {
    await supabase.auth.signOut();
    return fail("1");
  }
  redirect(next);
}

export async function logout() {
  const { error } = await (await supabaseAuth()).auth.signOut();
  if (error) console.error("Admin sign out failed", error);
  redirect("/admin/login?signedout=1");
}

export async function setStatus(formData: FormData) {
  await requireAdmin();
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(STATUSES) })
    .safeParse({ id: formData.get("id"), status: formData.get("status") });
  const to = (message: string) => redirect(adminRedirect(formData.get("back"), message, "/admin/orders"));
  if (!parsed.success) return to("Invalid status update.");

  const { data, error } = await supabaseAdmin()
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .select("code");
  if (error) {
    console.error("setStatus failed", error);
    return to("Couldn't update that order.");
  }
  if (!data?.length) return to("That order no longer exists.");
  revalidatePath("/admin");
  return to(`${data[0].code} is now ${parsed.data.status}.`);
}

export async function importBsps(formData: FormData) {
  await requireAdmin();
  const back = (message: string) => redirect(adminRedirect(formData.get("back"), message, "/admin/students"));
  const text = String(formData.get("bsps") ?? "");
  const unique = new Set(
    text
      .split(/[\s,;]+/)
      .map(normalizeBsp)
      // Ignore CSV headers like "BSP"/"Roll no": real IDs contain a digit.
      .filter((t) => BSP_PATTERN.test(t) && /\d/.test(t)),
  );
  const rows = [...unique].map((bsp) => ({ bsp, active: true }));
  if (rows.length === 0) return back("No valid BSP numbers found in that text.");

  const db = supabaseAdmin();
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await db.from("bsp_allowlist").upsert(rows.slice(i, i + CHUNK), { onConflict: "bsp" });
    if (error) {
      console.error("importBsps failed", error);
      return back("Import failed part-way. Check the logs and try again.");
    }
  }
  revalidatePath("/admin");
  return back(`Imported ${rows.length} BSP numbers.`);
}

export async function removeBsp(formData: FormData) {
  await requireAdmin();
  const back = (message: string) => redirect(adminRedirect(formData.get("back"), message, "/admin/students"));
  const bsp = normalizeBsp(String(formData.get("bsp") ?? ""));
  if (!BSP_PATTERN.test(bsp)) return back("Enter a valid BSP number to remove.");

  const { error } = await supabaseAdmin().from("bsp_allowlist").delete().eq("bsp", bsp);
  if (error) {
    console.error("removeBsp failed", error);
    return back("Couldn't remove that BSP number.");
  }
  revalidatePath("/admin");
  return back(`Removed ${bsp}.`);
}
