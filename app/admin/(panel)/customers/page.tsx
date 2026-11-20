import type { Metadata } from "next";
import Link from "next/link";
import { card, ErrorNote, PageHeader } from "@/components/admin/ui";
import { Pagination } from "@/components/Pagination";
import { searchTerm } from "@/lib/admin-schemas";
import { paginate, parsePage } from "@/lib/pagination";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase";

export const metadata: Metadata = { title: "Customers: StickNstay admin", robots: { index: false } };

// Supabase returns at most this many rows per request, whatever .limit() says.
const MAX_ROWS = 1000;

type OrderRow = {
  bsp: string;
  name: string;
  mobile: string;
  email: string | null;
  qty: number;
  total: number;
  status: string;
  created_at: string;
};
type Customer = {
  bsp: string;
  name: string;
  mobile: string;
  email: string | null;
  orders: number;
  magnets: number;
  paid: number;
  due: number;
  last: string;
};
type Props = { searchParams: Promise<{ q?: string; page?: string }> };

const PAGE_SIZE = 20;

const field =
  "min-h-11 rounded-xl border border-line bg-surface px-3 py-2 text-sm placeholder:text-muted focus:border-fg";

export default async function AdminCustomersPage({ searchParams }: Props) {
  await requireAdmin();
  const { q, page: rawPage } = await searchParams;
  const term = searchTerm(q).toLowerCase();

  // Newest first, so the first order seen per student carries their latest contact details.
  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select("bsp, name, mobile, email, qty, total, status, created_at")
    .order("created_at", { ascending: false })
    .limit(MAX_ROWS)
    .returns<OrderRow[]>();
  if (error) console.error("Admin customers load failed", error);

  // A customer is a student with at least one non-cancelled order.
  const byBsp = new Map<string, Customer>();
  for (const o of data ?? []) {
    if (o.status === "cancelled") continue;
    const c = byBsp.get(o.bsp) ?? {
      bsp: o.bsp,
      name: o.name,
      mobile: o.mobile,
      email: o.email,
      orders: 0,
      magnets: 0,
      paid: 0,
      due: 0,
      last: o.created_at,
    };
    byBsp.set(o.bsp, {
      ...c,
      orders: c.orders + 1,
      magnets: c.magnets + o.qty,
      paid: c.paid + (o.status === "delivered" ? o.total : 0),
      due: c.due + (o.status === "delivered" ? 0 : o.total),
    });
  }

  const all = [...byBsp.values()];
  const matches = term
    ? all.filter((c) => [c.name, c.bsp, c.mobile, c.email ?? ""].some((v) => v.toLowerCase().includes(term)))
    : all;
  const paged = paginate(matches, parsePage(rawPage), PAGE_SIZE);
  const customers = paged.items;
  const truncated = (data?.length ?? 0) >= MAX_ROWS;

  return (
    <>
      <PageHeader
        title="Customers"
        description={`${all.length} student${all.length === 1 ? "" : "s"} who have ordered. Everyone else on the allowlist is under Students.`}
      >
        <Link href="/admin/students" className="btn-ghost press text-sm">
          View all students
        </Link>
      </PageHeader>

      {error && <ErrorNote>Couldn&apos;t load customers. Check the Vercel logs.</ErrorNote>}
      {truncated && <ErrorNote>Only the latest {MAX_ROWS} orders are counted, so older customers or totals may be missing.</ErrorNote>}

      <form className={`${card} flex flex-wrap gap-3 p-4`} role="search">
        <input name="q" defaultValue={term} placeholder="Search name, BSP, mobile or email" className={`${field} min-w-56 flex-1`} />
        <button className="btn press text-sm">Search</button>
      </form>

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-muted">
            <tr className="border-b border-line bg-paper/60">
              <th scope="col" className="px-5 py-3 font-semibold">Customer</th>
              <th scope="col" className="px-5 py-3 font-semibold">Orders</th>
              <th scope="col" className="px-5 py-3 font-semibold">Magnets</th>
              <th scope="col" className="px-5 py-3 font-semibold">Paid ₹</th>
              <th scope="col" className="px-5 py-3 font-semibold">Due ₹</th>
              <th scope="col" className="px-5 py-3 font-semibold">Last order</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && !error && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted">
                  {all.length === 0 ? "No customers yet. Students appear here after their first order." : "No customers match."}
                </td>
              </tr>
            )}
            {customers.map((c) => (
              <tr key={c.bsp} className="border-b border-line last:border-0">
                <td className="px-5 py-3">
                  <span className="font-semibold">{c.name}</span>
                  <span className="block text-muted">
                    {c.bsp} · {c.mobile}
                  </span>
                  {c.email && <span className="block text-muted">{c.email}</span>}
                </td>
                <td className="px-5 py-3">{c.orders}</td>
                <td className="px-5 py-3">{c.magnets}</td>
                <td className="px-5 py-3 font-semibold">₹{c.paid}</td>
                <td className="px-5 py-3">₹{c.due}</td>
                <td className="px-5 py-3 text-muted">
                  {new Date(c.last).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={paged.page} pages={paged.pages} total={paged.total} size={PAGE_SIZE} basePath="/admin/customers" params={{ q: term }} />
    </>
  );
}
