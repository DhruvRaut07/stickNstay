import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

/** Pure auth helpers (no I/O) so they are easy to test. Cookie/DB glue lives in session.ts + app/login. */

export const COLLEGE_EMAIL_DOMAIN = "ibsindia.org";
export const SESSION_COOKIE = "sns_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60_000;
export const CODE_TTL_MS = 10 * 60_000;

const BSP = /^[A-Z0-9]{3,24}$/;
const b64 = (buf: Buffer) => buf.toString("base64url");

export const isBsp = (v: string): boolean => BSP.test(v);

/** Letters-only lowercase tokens of at least 3 chars: "dhruv.raut26" -> ["dhruv", "raut"]. */
const tokens = (s: string): string[] =>
  s
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((t) => t.length >= 3);

/**
 * The email must be on the college domain AND its name part must contain a word from the
 * roster name (dhruv.raut26@ibsindia.org matches "DHRUV RAUT"). This stops a classmate from
 * claiming someone else's BSP number with their own mailbox.
 */
export function emailMatchesStudent(email: string, rosterName: string): boolean {
  const [local, domain, ...rest] = email.trim().toLowerCase().split("@");
  if (!local || domain !== COLLEGE_EMAIL_DOMAIN || rest.length > 0) return false;
  const nameWords = new Set(tokens(rosterName));
  return tokens(local).some((t) => nameWords.has(t));
}

export const generateCode = (): string => String(randomInt(0, 1_000_000)).padStart(6, "0");

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (32+ characters)");
  return s;
}

const hmac = (data: string): Buffer => createHmac("sha256", secret()).update(data).digest();

const safeEqual = (a: Buffer, b: Buffer): boolean => a.length === b.length && timingSafeEqual(a, b);

/** One-way hash of a login code; bound to the BSP so a code can't be replayed for another student. */
export const hashCode = (bsp: string, code: string): string => b64(hmac(`code:${bsp}:${code}`));

export const codeMatches = (bsp: string, code: string, storedHash: string): boolean =>
  safeEqual(Buffer.from(hashCode(bsp, code)), Buffer.from(storedHash));

/** Cookie value: `<bsp>.<expiryMs>.<signature>`. */
export function signSession(bsp: string, now = Date.now()): string {
  const body = `${bsp}.${now + SESSION_TTL_MS}`;
  return `${body}.${b64(hmac(`session:${body}`))}`;
}

/** Returns the BSP if the token is genuine and unexpired, otherwise null. */
export function readSession(token: string | undefined, now = Date.now()): string | null {
  const parts = token?.split(".");
  if (!parts || parts.length !== 3) return null;
  const [bsp, exp, sig] = parts;
  if (!isBsp(bsp) || !(Number(exp) > now)) return null;
  const expected = b64(hmac(`session:${bsp}.${exp}`));
  return safeEqual(Buffer.from(sig), Buffer.from(expected)) ? bsp : null;
}

/** Only allow same-site relative redirects after login (blocks open-redirects). */
export const safeNext = (next: string | null | undefined): string =>
  next && /^\/(?!\/)[\w\-/?=&.%]*$/.test(next) ? next : "/shop";
