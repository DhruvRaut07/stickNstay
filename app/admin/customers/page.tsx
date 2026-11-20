import type { Metadata } from "next";
import { AdminNav } from "@/components/AdminNav";
import { orIlike, searchTerm } from "@/lib/admin-schemas";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase";

export const metadata: Metadata = { title: "Customers: StickNstay admin", robots: { index: false } };

// Supabase returns at most this many rows per request, whatever .limit() says.
const MAX_ROWS = 1000;

type Student = { bsp: string; name: string | null; email: string | null; active: boolean };
type OrderRow = { bsp: string; qty: number; total: number; status: string };
type Props = { searchParams: Promise<{ q?: string }> };

const LIMIT = 300;
const field =
  "min-h-11 rounded-2xl border border-line bg-surface px-3 py-2 text-sm placeholder:text-muted focus:border-fg";

export default async function AdminCustomersPage({ searchParams }: Props) {
  await requireAdmin();
  const { q } = await searchParams;
  const db = supabaseAdmin();
  const term = searchTerm(q);

  let students = db.from("bsp_allowlist").select("bsp, name, email, active").order("bsp").limit(LIMIT);
  if (term) students = students.or(orIlike(["bsp", "name", "email"], term));

  const [studentsRes, ordersRes, totalRes] = await Promise.all([
    students.returns<Student[]>(),
    db.from("orders").select("bsp, qty, total, status").limit(5000).returns<OrderRow[]>(),
    db.from("bsp_allowlist").select("*", { count: "exact", head: true }),
  ]);
  for (const [label, res] of [["students", studentsRes], ["orders", ordersRes], ["count", totalRes]] as const) {
    if (res.error) console.error(`Admin customers: ${label} load failed`, res.error);
  }

  const perBsp = new Map<string, { orders: number; magnets: number; delivered: number }>();
  for (const o of ordersRes.data ?? []) {
    if (o.status === "cancelled") continue;
    const s = perBsp.get(o.bsp) ?? { orders: 0, magnets: 0, delivered: 0 };
    perBsp.set(o.bsp, {
      orders: s.orders + 1,
      magnets: s.magnets + o.qty,
      delivered: s.delivered + (o.status === "delivered" ? o.total : 0),
    });
  }

  const rows = studentsRes.data ?? [];
  const loadFailed = studentsRes.error || ordersRes.error;
  const truncated = (ordersRes.data?.length ?? 0) >= MAX_ROWS;

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10">
      <AdminNav />
      <h1 className="headline mt-8">Customers</h1>
      <p className="mt-2 text-muted">
        {totalRes.count ?? 0} students on the allowlist. Counts exclude cancelled orders.
      </p>

      {loadFailed && (
        <p role="alert" className="mt-4 font-medium text-link">
          Couldn&apos;t load {studentsRes.error ? "students" : "order totals"}. Check the Vercel logs.
        </p>
      )}

      {truncated && (
        <p role="alert" className="mt-4 font-medium text-link">
          Only the latest {MAX_ROWS} orders are counted, so totals below may be low.
        </p>
      )}

      <form className="mt-6 flex flex-wrap gap-3" role="search">
        <input name="q" defaultValue={term} placeholder="Search BSP, name or email" className={`${field} min-w-56 flex-1`} />
        <button className="btn press text-sm">Search</button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-[28px] border border-line bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-paper text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Student</th>
              <th scope="col" className="px-4 py-3 font-semibold">BSP</th>
              <th scope="col" className="px-4 py-3 font-semibold">Orders</th>
              <th scope="col" className="px-4 py-3 font-semibold">Magnets</th>
              <th scope="col" className="px-4 py-3 font-semibold">Delivered ₹</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loadFailed && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No students match.
                </td>
              </tr>
            )}
            {rows.map((s) => {
              const stats = perBsp.get(s.bsp);
              return (
                <tr key={s.bsp} className="border-t border-line">
                  <td className="px-4 py-3">
                    <span className="font-semibold">{s.name ?? "Not set"}</span>
                    <span className="block text-muted">{s.email ?? "Not logged in yet"}</span>
                    {!s.active && <span className="text-xs font-semibold text-link">Disabled</span>}
                  </td>
                  <td className="px-4 py-3">{s.bsp}</td>
                  <td className="px-4 py-3">{stats?.orders ?? 0}</td>
                  <td className="px-4 py-3">{stats?.magnets ?? 0}</td>
                  <td className="px-4 py-3">₹{stats?.delivered ?? 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {(totalRes.count ?? 0) > LIMIT && !term && (
        <p className="mt-3 text-sm text-muted">Showing the first {LIMIT}. Search to find others.</p>
      )}
    </main>
  );
}
