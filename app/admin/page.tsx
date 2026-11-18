import type { Metadata } from "next";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase";
import { importBsps, logout, removeBsp, setStatus } from "./actions";

export const metadata: Metadata = { title: "Admin: StickNstay", robots: { index: false } };

const STATUSES = ["new", "confirmed", "delivered", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

type Order = {
  id: string;
  code: string;
  bsp: string;
  name: string;
  mobile: string;
  email: string | null;
  variant: "basic" | "custom";
  qty: number;
  total: number;
  image_path: string | null;
  note: string | null;
  status: Status;
  created_at: string;
};

type Props = { searchParams: Promise<{ status?: string; q?: string; msg?: string }> };

const SIGNED_URL_SECONDS = 600;
const istDay = (iso: string | Date) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const field =
  "min-h-11 rounded-2xl border border-line bg-surface px-3 py-2 text-sm placeholder:text-muted focus:border-fg";

export default async function AdminPage({ searchParams }: Props) {
  await requireAdmin();
  const { status, q, msg } = await searchParams;
  const db = supabaseAdmin();

  let list = db.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (STATUSES.includes(status as Status)) list = list.eq("status", status as Status);
  // Strip characters that have meaning inside a PostgREST or() filter.
  const term = (q ?? "").replace(/[%,()*.\\]/g, "").trim().slice(0, 40);
  if (term) list = list.or(`name.ilike.%${term}%,bsp.ilike.%${term}%,code.ilike.%${term}%`);

  const [{ data: orders, error }, { data: all }, { count: bspCount }] = await Promise.all([
    list.returns<Order[]>(),
    db.from("orders").select("status, variant, qty, total, created_at").limit(5000),
    db.from("bsp_allowlist").select("*", { count: "exact", head: true }),
  ]);

  const rows = orders ?? [];
  const today = istDay(new Date());
  const stats = (all ?? []).reduce(
    (s, o) => ({
      today: s.today + (istDay(o.created_at) === today && o.status !== "cancelled" ? 1 : 0),
      revenue: s.revenue + (o.status === "delivered" ? o.total : 0),
      basic: s.basic + (o.variant === "basic" && o.status !== "cancelled" ? o.qty : 0),
      custom: s.custom + (o.variant === "custom" && o.status !== "cancelled" ? o.qty : 0),
    }),
    { today: 0, revenue: 0, basic: 0, custom: 0 },
  );

  const paths = rows.flatMap((o) => (o.image_path ? [o.image_path] : []));
  const signed = paths.length
    ? (await db.storage.from("uploads").createSignedUrls(paths, SIGNED_URL_SECONDS)).data ?? []
    : [];
  const imageUrl = new Map(signed.map((s) => [s.path, s.signedUrl]));

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10">
      <div className="flex items-center justify-between">
        <h1 className="headline">Orders</h1>
        <form action={logout}>
          <button className="btn-ghost press text-sm">
            Sign out
          </button>
        </form>
      </div>

      {msg && (
        <p role="status" className="mt-4 rounded-2xl bg-accent p-4 text-sm font-medium">
          {msg}
        </p>
      )}

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Orders today", stats.today],
          ["Delivered revenue", `₹${stats.revenue}`],
          ["Basic magnets", stats.basic],
          ["Custom magnets", stats.custom],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[28px] border border-line bg-surface p-4 shadow-[var(--shadow-card)]">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="mt-1 text-2xl font-bold">{value}</dd>
          </div>
        ))}
      </dl>

      <form className="mt-8 flex flex-wrap gap-3" role="search">
        <input name="q" defaultValue={term} placeholder="Search name, BSP or code" className={`${field} min-w-56 flex-1`} />
        <select name="status" defaultValue={status ?? ""} className={field} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="btn press text-sm">
          Filter
        </button>
      </form>

      {error && <p role="alert" className="mt-6 font-medium text-link">Couldn&apos;t load orders.</p>}

      <ul className="mt-6 space-y-3">
        {rows.length === 0 && !error && <li className="py-10 text-center text-muted">No orders yet.</li>}
        {rows.map((o) => {
          const url = o.image_path ? imageUrl.get(o.image_path) : undefined;
          return (
            <li key={o.id} className="rounded-[28px] border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {o.name} <span className="font-normal text-muted">· {o.bsp}</span>
                  </p>
                  <p className="text-sm text-muted">
                    {o.mobile}
                    {o.email ? ` · ${o.email}` : ""}
                  </p>
                  <p className="mt-1 text-sm">
                    {o.code} · {o.qty} × {o.variant} · <strong>₹{o.total}</strong> COD
                  </p>
                  {o.note && <p className="mt-1 text-sm text-muted">“{o.note}”</p>}
                  <p className="mt-1 text-xs text-muted">
                    {new Date(o.created_at).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <form action={setStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={o.id} />
                    <select name="status" defaultValue={o.status} className={field} aria-label={`Status for ${o.code}`}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button className="btn press text-sm">
                      Save
                    </button>
                  </form>
                  {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-link hover:underline">
                      Open image ›
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <section className="mt-14 rounded-[28px] border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-2xl font-bold">BSP allowlist</h2>
        <p className="mt-1 text-sm text-muted">
          {bspCount ?? 0} verified BSP numbers. Only these students can order.
        </p>
        <form action={importBsps} className="mt-4 space-y-3">
          <label className="block text-sm font-medium" htmlFor="bsps">
            Paste BSP numbers (one per line, or comma-separated). Adds to the list; duplicates are ignored.
          </label>
          <textarea id="bsps" name="bsps" rows={5} className={`${field} w-full`} />
          <button className="btn press text-sm">
            Import
          </button>
        </form>
        <form action={removeBsp} className="mt-6 flex flex-wrap gap-3 border-t border-line pt-6">
          <input name="bsp" placeholder="BSP number to remove" aria-label="BSP number to remove" className={`${field} min-w-56`} />
          <button className="btn-ghost press text-sm">Remove</button>
        </form>
      </section>
    </main>
  );
}
