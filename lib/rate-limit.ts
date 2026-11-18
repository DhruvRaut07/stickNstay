// ponytail: in-memory, per server instance. Move to Upstash/Redis if we ever run
// multiple instances or need limits that survive restarts.
const hits = new Map<string, number[]>();
const MAX_KEYS = 10_000;

/** Returns true if the call is allowed, false if `key` exceeded `max` in `windowMs`. */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  if (hits.size > MAX_KEYS) hits.clear();
  hits.set(key, [...recent, now]);
  return true;
}
