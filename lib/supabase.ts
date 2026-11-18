import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

/** Service-role client. Bypasses RLS: server-side only, never expose to the browser. */
export const supabaseAdmin = () =>
  createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });

/** Cookie-backed client used only to read the logged-in admin's session. */
export async function supabaseAuth() {
  const store = await cookies();
  return createServerClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // proxy.ts refreshes the session, so this is safe to ignore.
          }
        },
      },
    },
  );
}

/** Returns the admin's email if the session is valid AND listed in `admins`. */
export async function getAdmin(): Promise<string | null> {
  const { data } = await (await supabaseAuth()).auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email) return null;
  const { data: row } = await supabaseAdmin()
    .from("admins")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  return row ? email : null;
}

export async function requireAdmin(): Promise<string> {
  const email = await getAdmin();
  if (!email) redirect("/admin/login");
  return email;
}
