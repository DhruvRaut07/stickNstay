import type { Metadata } from "next";
import Link from "next/link";
import { card, ErrorNote, PageHeader, Pill } from "@/components/admin/ui";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase";

export const metadata: Metadata = { title: "Dashboard: StickNstay admin", robots: { index: false } };

type Status = "new" | "confirmed" | "delivered" | "cancelled";
type Order = {
  code: string;
  name: string;
  bsp: string;
  variant: "basic" | "custom";
  qty: number;
  total: number;
  status: Status;
  created_at: string;
};

// Supabase returns at most this many rows per request, whatever .limit() says.
const MAX_ROWS = 1000;
const DAYS = 7;
const DAY_MS = 86_400_000;
const istDay = (d: Date | string) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const weekday = (d: Date) => d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short" });

export default async function DashboardPage() {
  await requireAdmin();
  const db = supabaseAdmin();

  const [ordersRes, studentsRes, productsRes] = await Promise.all([
    db
      .from("orders")
      .select("code, name, bsp, variant, qty, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(MAX_ROWS)
      .returns<Order[]>(),
    db.from("bsp_allowlist").select("*", { count: "exact", head: true }),
    db.from("products").select("*", { count: "exact", head: true }).eq("active", true),
  ]);
  for (const [label, res] of [["orders", ordersRes], ["students", studentsRes], ["products", productsRes]] as const) {
    if (res.error) console.error(`Dashboard: ${label} load failed`, res.error);
  }

  const orders = ordersRes.data ?? [];
  const live = orders.filter((o) => o.status !== "cancelled");
  const now = new Date();
  const today = istDay(now);
  const kpis = {
    today: live.filter((o) => istDay(o.created_at) === today).length,
    awaiting: orders.filter((o) => o.status === "new").length,
    toCollect: live.filter((o) => o.status !== "delivered").reduce((s, o) => s + o.total, 0),
    revenue: orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0),
    magnets: live.reduce((s, o) => s + o.qty, 0),
  };

  const perDay = Array.from({ length: DAYS }, (_, i) => {
    const date = new Date(now.getTime() - (DAYS - 1 - i) * DAY_MS);
    const key = istDay(date);
    return { key, label: weekday(date), count: live.filter((o) => istDay(o.created_at) === key).length };
  });
  const peak = Math.max(1, ...perDay.map((d) => d.count));
  const failed = ordersRes.error || studentsRes.error || productsRes.error;

  const stats = [
    ["Orders today", kpis.today, "excl. cancelled"],
    ["Awaiting action", kpis.awaiting, "status: new"],
    ["Cash to collect", `₹${kpis.toCollect}`, "not yet delivered"],
    ["Delivered revenue", `₹${kpis.revenue}`, "cash collected"],
  ] as const;

  return (
    <>
      <PageHeader title="Dashboard" description="How the campus drop is going.">
        <Link href="/admin/orders?status=new" className="btn press text-sm">
          Review new orders
        </Link>
      </PageHeader>

      {failed && <ErrorNote>Some numbers couldn&apos;t load. Check the Vercel logs.</ErrorNote>}
      {orders.length >= MAX_ROWS && <ErrorNote>Only the latest {MAX_ROWS} orders are counted, so totals may be low.</ErrorNote>}

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value, hint]) => (
          <div key={label} className={`${card} p-5`}>
            <dt className="text-sm font-medium text-muted">{label}</dt>
            <dd className="mt-2 text-3xl font-bold">{value}</dd>
            <dd className="mt-1 text-xs text-muted">{hint}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className={`${card} p-5 lg:col-span-2`} aria-labelledby="chart-title">
          <h2 id="chart-title" className="text-lg font-bold">
            Orders, last {DAYS} days
          </h2>
          <ol className="mt-5 flex h-44 items-end gap-3">
            {perDay.map((d) => (
              <li key={d.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-sm font-semibold">{d.count}</span>
                <span
                  aria-hidden="true"
                  className="w-full rounded-t-lg bg-accent"
                  style={{ height: `${Math.max((d.count / peak) * 100, 4)}%` }}
                />
                <span className="text-xs text-muted">{d.label}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className={`${card} p-5`} aria-labelledby="snapshot-title">
          <h2 id="snapshot-title" className="text-lg font-bold">
            Snapshot
          </h2>
          <dl className="mt-4 divide-y divide-line text-sm">
            {[
              ["Customers (have ordered)", new Set(live.map((o) => o.bsp)).size],
              ["Eligible students", studentsRes.count ?? "?"],
              ["Magnets ordered", kpis.magnets],
              ["Products in shop", productsRes.count ?? "?"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-3">
                <dt className="text-muted">{label}</dt>
                <dd className="font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section className={card} aria-labelledby="recent-title">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 id="recent-title" className="text-lg font-bold">
            Recent orders
          </h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-link hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-muted">
              <tr className="border-y border-line bg-paper/60">
                <th scope="col" className="px-5 py-3 font-semibold">Order</th>
                <th scope="col" className="px-5 py-3 font-semibold">Student</th>
                <th scope="col" className="px-5 py-3 font-semibold">Items</th>
                <th scope="col" className="px-5 py-3 font-semibold">Total</th>
                <th scope="col" className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && !ordersRes.error && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted">
                    No orders yet.
                  </td>
                </tr>
              )}
              {orders.slice(0, 8).map((o) => (
                <tr key={o.code} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-semibold">{o.code}</td>
                  <td className="px-5 py-3">
                    {o.name}
                    <span className="block text-xs text-muted">{o.bsp}</span>
                  </td>
                  <td className="px-5 py-3">
                    {o.qty} × {o.variant}
                  </td>
                  <td className="px-5 py-3 font-semibold">₹{o.total}</td>
                  <td className="px-5 py-3">
                    <Pill tone={o.status}>{o.status}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
