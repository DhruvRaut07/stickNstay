"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { CODE_TTL_MS, codeMatches, emailMatchesStudent, generateCode, hashCode, safeNext } from "@/lib/auth";
import { sendLoginCode, sendWelcomeMail } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";
import { normalizeBsp } from "@/lib/rules";
import { authConfigured, endSession, startSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export type LoginState = {
  step: "request" | "verify";
  bsp?: string;
  email?: string;
  next: string;
  error?: string;
};

const TEN_MINUTES = 10 * 60_000;
// One message for every "not you" case, so the form can't be used to probe who is on the roster.
const NO_MATCH =
  "Those details don't match our IBS Mumbai student list. Use your BSP number and your own @ibsindia.org email.";
const TRY_LATER = "Too many attempts. Please wait a few minutes and try again.";

const requestSchema = z.object({
  bsp: z.string().transform(normalizeBsp).pipe(z.string().regex(/^[A-Z0-9]{3,24}$/)),
  email: z.string().trim().toLowerCase().pipe(z.email().max(120)),
});
const verifySchema = z.object({
  bsp: z.string().transform(normalizeBsp).pipe(z.string().regex(/^[A-Z0-9]{3,24}$/)),
  code: z.string().trim().regex(/^\d{6}$/),
});

async function clientIp(): Promise<string> {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

async function requestCode(formData: FormData, next: string): Promise<LoginState> {
  // Keep what they typed so a typo doesn't mean retyping everything.
  const typed = { bsp: String(formData.get("bsp") ?? ""), email: String(formData.get("email") ?? "") };
  const fail = (error: string): LoginState => ({ step: "request", next, error, ...typed });
  const parsed = requestSchema.safeParse({ bsp: formData.get("bsp"), email: formData.get("email") });
  if (!parsed.success) return fail("Enter your BSP number and your @ibsindia.org email.");
  const { bsp, email } = parsed.data;

  if (!authConfigured()) return fail("Login isn't set up yet. Please try again later.");
  if (!rateLimit(`login-ip:${await clientIp()}`, 10, TEN_MINUTES) || !rateLimit(`login-bsp:${bsp}`, 5, TEN_MINUTES)) {
    return fail(TRY_LATER);
  }

  const db = supabaseAdmin();
  const { data: student, error } = await db
    .from("bsp_allowlist")
    .select("name, active, email")
    .eq("bsp", bsp)
    .maybeSingle();
  if (error) {
    console.error("Roster lookup failed", error);
    return fail("Something went wrong. Please try again.");
  }
  const { data: owner, error: ownerError } = await db
    .from("bsp_allowlist")
    .select("bsp")
    .eq("email", email)
    .neq("bsp", bsp)
    .limit(1);
  if (ownerError) {
    console.error("Mailbox owner lookup failed", ownerError);
    return fail("Something went wrong. Please try again.");
  }

  const eligible =
    student?.active &&
    student.name &&
    emailMatchesStudent(email, student.name) &&
    (!student.email || student.email === email) && // once bound, only that mailbox may log in
    !owner?.length; // one mailbox, one BSP
  if (!eligible) return fail(NO_MATCH);

  const code = generateCode();
  const { error: saveError } = await db.from("login_codes").upsert({
    bsp,
    email,
    code_hash: hashCode(bsp, code),
    expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
  });
  if (saveError) {
    console.error("Saving login code failed", saveError);
    return fail("Something went wrong. Please try again.");
  }
  if (!(await sendLoginCode(email, code))) {
    const { error: cleanupError } = await db.from("login_codes").delete().eq("bsp", bsp);
    if (cleanupError) console.error("Removing unsent login code failed", cleanupError);
    return fail("We couldn't send the email. Please try again in a minute.");
  }
  return { step: "verify", bsp, email, next };
}

/** Returns an error state, or redirects (never returns) on success. */
async function verifyCode(formData: FormData, next: string): Promise<LoginState> {
  const parsed = verifySchema.safeParse({ bsp: formData.get("bsp"), code: formData.get("code") });
  const email = String(formData.get("email") ?? "");
  if (!parsed.success) {
    return { step: "verify", bsp: String(formData.get("bsp") ?? ""), email, next, error: "Enter the 6-digit code." };
  }
  const { bsp, code } = parsed.data;
  const again = (error: string): LoginState => ({ step: "verify", bsp, email, next, error });

  if (!authConfigured()) return { step: "request", next, error: "Login isn't set up yet. Please try again later." };
  if (!rateLimit(`verify-bsp:${bsp}`, 5, TEN_MINUTES) || !rateLimit(`verify-ip:${await clientIp()}`, 20, TEN_MINUTES)) {
    return again(TRY_LATER);
  }

  const db = supabaseAdmin();
  const { data: row, error: lookupError } = await db
    .from("login_codes")
    .select("email, code_hash, expires_at")
    .eq("bsp", bsp)
    .maybeSingle();
  if (lookupError) {
    console.error("Login code lookup failed", lookupError);
    return again("Something went wrong. Please try again.");
  }
  if (!row || new Date(row.expires_at).getTime() < Date.now()) {
    return { step: "request", next, error: "That code has expired. Please request a new one." };
  }
  if (!codeMatches(bsp, code, row.code_hash)) return again("That code isn't right. Check the email and try again.");

  // Fail closed: a code that could not be deleted must not stay usable.
  const { error: deleteError } = await db.from("login_codes").delete().eq("bsp", bsp);
  if (deleteError) {
    console.error("Deleting used login code failed", deleteError);
    return again("Something went wrong. Please try again.");
  }
  // Bind this mailbox to the BSP on first login (the unique index blocks one mailbox owning two BSPs).
  const { data: bound, error: bindError } = await db
    .from("bsp_allowlist")
    .update({ email: row.email })
    .eq("bsp", bsp)
    .is("email", null)
    .select("name");
  if (bindError) {
    console.error("Binding email failed", bindError);
    return { step: "request", next, error: NO_MATCH };
  }
  // A row came back only on the very first login: welcome every verified student, ordering or not.
  if (bound?.length) after(() => sendWelcomeMail(row.email, bound[0].name ?? ""));
  await startSession(bsp);
  redirect(safeNext(next));
}

export async function loginStep(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const next = safeNext(String(formData.get("next") ?? ""));
  return formData.get("intent") === "verify" ? verifyCode(formData, next) : requestCode(formData, next);
}

export async function logout() {
  await endSession();
  redirect("/login");
}
