"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { normalizeBsp } from "@/lib/rules";
import { getAdmin, requireAdmin, supabaseAdmin, supabaseAuth } from "@/lib/supabase";

const CHUNK = 500;
const BSP_PATTERN = /^[A-Z0-9/_-]{3,24}$/;
const STATUSES = ["new", "confirmed", "delivered", "cancelled"] as const;

const back = (message: string) => redirect(`/admin?msg=${encodeURIComponent(message)}`);

export async function login(formData: FormData) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`login:${ip}`, 8, 10 * 60_000)) redirect("/admin/login?error=rate");

  const parsed = z
    .object({ email: z.email(), password: z.string().min(1).max(200) })
    .safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) redirect("/admin/login?error=1");

  const supabase = await supabaseAuth();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // A valid Supabase user who is not in `admins` must not get in.
  if (error || !(await getAdmin())) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=1");
  }
  redirect("/admin");
}

export async function logout() {
  await (await supabaseAuth()).auth.signOut();
  redirect("/admin/login");
}

export async function setStatus(formData: FormData) {
  await requireAdmin();
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(STATUSES) })
    .safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return back("Invalid status update.");

  const { error } = await supabaseAdmin()
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error) {
    console.error("setStatus failed", error);
    return back("Couldn't update that order.");
  }
  revalidatePath("/admin");
}

export async function importBsps(formData: FormData) {
  await requireAdmin();
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
