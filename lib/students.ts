import "server-only";
import { supabaseAdmin } from "./supabase";

/** The college mailbox bound to a student at first login, or undefined. Never throws, so a lookup problem cannot fail an order. */
export async function getCollegeEmail(bsp: string): Promise<string | undefined> {
  const { data, error } = await supabaseAdmin().from("bsp_allowlist").select("email").eq("bsp", bsp).maybeSingle();
  if (error) {
    console.error("College email lookup failed", error);
    return undefined;
  }
  return data?.email ?? undefined;
}
