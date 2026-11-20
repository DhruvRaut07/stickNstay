import type { Metadata } from "next";
import { setStatus } from "@/app/admin/actions";
import { card, ErrorNote, FlashMessage, PageHeader, Pill } from "@/components/admin/ui";
import { Pagination } from "@/components/Pagination";
import { orIlike, searchTerm } from "@/lib/admin-schemas";
import { pageCount, pageRange, parsePage } from "@/lib/pagination";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase";

export const metadata: Metadata = { title: "Orders: StickNstay admin", robots: { index: false } };

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
  order_items: { product_name: string; qty: number }[];
};

type Props = { searchParams: Promise<{ status?: string; q?: string; msg?: string; page?: string }> };

const SIGNED_URL_SECONDS = 600;
const PAGE_SIZE = 20;
const field =
  "min-h-11 rounded-xl border border-line bg-surface px-3 py-2 text-sm placeholder:text-muted focus:border-fg";

export default async function AdminOrdersPage({ searchParams }: Props) {
  await requireAdmin();
  const { status, q, msg, page: rawPage } = await searchParams;
  const db = supabaseAdmin();
  const activeStatus = STATUSES.find((s) => s === status);
  const term = searchTerm(q);

  let list = db
    .from("orders")
    .select("*, order_items(product_name, qty)", { count: "exact" })
    .order("created_at", { ascending: false });
  if (activeStatus) list = list.eq("status", activeStatus);
  if (term) list = list.or(orIlike(["name", "bsp", "code"], term));

  const page = parsePage(rawPage);
  const [from, to] = pageRange(page, PAGE_SIZE);
  const { data, error, count } = await list.range(from, to).returns<Order[]>();
  if (error) console.error("Admin orders load failed", error);
  const rows = data ?? [];
  const total = count ?? rows.length;

  const paths = rows.flatMap((o) => (o.image_path ? [o.image_path] : []));
  const signedRes = paths.length ? await db.storage.from("uploads").createSignedUrls(paths, SIGNED_URL_SECONDS) : null;
  if (signedRes?.error) console.error("Admin signed URLs failed", signedRes.error);
  const imageUrl = new Map((signedRes?.data ?? []).map((s) => [s.path, s.signedUrl]));

  // Where to return after an action, so filters survive and a confirmation can show.
  const filters = { ...(activeStatus && { status: activeStatus }), ...(term && { q: term }) };
  const back = `/admin/orders?${new URLSearchParams({ ...filters, ...(page > 1 && { page: String(page) }) })}`;

  return (
    <>
      <PageHeader title="Orders" description="Confirm, deliver or cancel. Cash on delivery." />

      <FlashMessage message={msg} />
      {error && <ErrorNote>Couldn&apos;t load orders. Check the Vercel logs.</ErrorNote>}
      {signedRes?.error && <ErrorNote>Couldn&apos;t load customer images, so &quot;Open image&quot; links are missing.</ErrorNote>}

      <form className={`${card} flex flex-wrap gap-3 p-4`} role="search">
        <input name="q" defaultValue={term} placeholder="Search name, BSP or order code" className={`${field} min-w-56 flex-1`} />
        <select name="status" defaultValue={activeStatus ?? ""} className={field} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="btn press text-sm">Filter</button>
      </form>

      <p className="text-sm text-muted">
        {total} order{total === 1 ? "" : "s"}
      </p>

      <ul className="space-y-3">
        {rows.length === 0 && !error && <li className={`${card} py-12 text-center text-muted`}>No orders match.</li>}
        {rows.map((o) => {
          const url = o.image_path ? imageUrl.get(o.image_path) : undefined;
          return (
            <li key={o.id} className={`${card} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{o.code}</span>
                    <Pill tone={o.status}>{o.status}</Pill>
                    <Pill tone="neutral">{o.variant}</Pill>
                  </p>
                  <p className="mt-2 font-semibold">
                    {o.name} <span className="font-normal text-muted">· {o.bsp}</span>
                  </p>
                  <p className="text-sm text-muted">
                    {o.mobile}
                    {o.email ? ` · ${o.email}` : ""}
                  </p>
                  <p className="mt-2 text-sm">
                    {o.qty} × {o.variant} · <strong>₹{o.total}</strong> cash on delivery
                  </p>
                  {o.order_items.length > 0 && (
                    <ul className="mt-1 list-disc pl-5 text-sm">
                      {o.order_items.map((item) => (
                        <li key={item.product_name}>
                          {item.qty} × {item.product_name}
                        </li>
                      ))}
                    </ul>
                  )}
                  {o.note && <p className="mt-2 text-sm text-muted">“{o.note}”</p>}
                  <p className="mt-2 text-xs text-muted">
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
                    <input type="hidden" name="back" value={back} />
                    <select name="status" defaultValue={o.status} className={field} aria-label={`Status for ${o.code}`}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button className="btn press text-sm">Save</button>
                  </form>
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center text-sm font-semibold text-link hover:underline"
                    >
                      Open image ›
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <Pagination page={page} pages={pageCount(total, PAGE_SIZE)} total={total} size={PAGE_SIZE} basePath="/admin/orders" params={filters} />
    </>
  );
}
