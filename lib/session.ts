import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { SESSION_COOKIE, SESSION_TTL_MS, readSession, signSession } from "./auth";
import { DEMO_ORDERS } from "./site";
import { supabaseAdmin } from "./supabase";

export type Student = { bsp: string; name: string };

/** Used only in local dev while Supabase/session secrets are missing, so the UI can still be previewed. */
const DEMO_STUDENT: Student = { bsp: "26BSP0000", name: "Demo Student" };

export const authConfigured = (): boolean =>
  Boolean(
    process.env.SESSION_SECRET &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

/** The logged-in student, or null. Re-checks the roster so a deactivated BSP loses access at once. */
export const getStudent = cache(async (): Promise<Student | null> => {
  if (!authConfigured()) {
    return DEMO_ORDERS && process.env.NODE_ENV !== "production" ? DEMO_STUDENT : null;
  }
  const bsp = readSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!bsp) return null;
  const { data } = await supabaseAdmin()
    .from("bsp_allowlist")
    .select("name, active")
    .eq("bsp", bsp)
    .maybeSingle();
  return data?.active ? { bsp, name: data.name ?? bsp } : null;
});

/** For pages: send anonymous visitors to the login page, then back to `next`. */
export async function requireStudent(next: string): Promise<Student> {
  const student = await getStudent();
  if (!student) redirect(`/login?next=${encodeURIComponent(next)}`);
  return student;
}

export async function startSession(bsp: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, signSession(bsp), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
