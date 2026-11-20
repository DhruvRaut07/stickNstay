import type { Metadata } from "next";
import { importBsps, removeBsp } from "@/app/admin/actions";
import { card, ErrorNote, FlashMessage, PageHeader, Pill } from "@/components/admin/ui";
import { Pagination } from "@/components/Pagination";
import { orIlike, searchTerm } from "@/lib/admin-schemas";
import { pageCount, pageRange, parsePage } from "@/lib/pagination";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase";

export const metadata: Metadata = { title: "Students: StickNstay admin", robots: { index: false } };

// Supabase returns at most this many rows per request, whatever .limit() says.
const MAX_ROWS = 1000;
const PAGE_SIZE = 25;

type Student = { bsp: string; name: string | null; email: string | null; active: boolean };
type Props = { searchParams: Promise<{ q?: string; msg?: string; page?: string }> };

const field =
  "min-h-11 rounded-xl border border-line bg-surface px-3 py-2 text-sm placeholder:text-muted focus:border-fg";

export default async function AdminStudentsPage({ searchParams }: Props) {
  await requireAdmin();
  const { q, msg, page: rawPage } = await searchParams;
  const db = supabaseAdmin();
  const term = searchTerm(q);

  const page = parsePage(rawPage);
  const [from, to] = pageRange(page, PAGE_SIZE);
  let students = db.from("bsp_allowlist").select("bsp, name, email, active", { count: "exact" }).order("bsp");
  if (term) students = students.or(orIlike(["bsp", "name", "email"], term));

  const [studentsRes, ordersRes, totalRes] = await Promise.all([
    students.range(from, to).returns<Student[]>(),
    db.from("orders").select("bsp, status").limit(MAX_ROWS),
    db.from("bsp_allowlist").select("*", { count: "exact", head: true }),
  ]);
  for (const [label, res] of [["students", studentsRes], ["orders", ordersRes], ["count", totalRes]] as const) {
    if (res.error) console.error(`Admin students: ${label} load failed`, res.error);
  }

  // A student becomes a customer once they have a non-cancelled order.
  const buyers = new Set((ordersRes.data ?? []).filter((o) => o.status !== "cancelled").map((o) => o.bsp));
  const rows = studentsRes.data ?? [];
  const loadFailed = studentsRes.error || ordersRes.error;
  const truncated = (ordersRes.data?.length ?? 0) >= MAX_ROWS;

  return (
    <>
      <PageHeader
        title="Students"
        description={`${totalRes.count ?? 0} eligible students (your population). They become customers when they order.`}
      />

      <FlashMessage message={msg} />
      {loadFailed && (
        <ErrorNote>Couldn&apos;t load {studentsRes.error ? "students" : "order data"}. Check the Vercel logs.</ErrorNote>
      )}
      {truncated && <ErrorNote>Only the latest {MAX_ROWS} orders were checked, so some &quot;customer&quot; tags may be missing.</ErrorNote>}

      <form className={`${card} flex flex-wrap gap-3 p-4`} role="search">
        <input name="q" defaultValue={term} placeholder="Search BSP, name or email" className={`${field} min-w-56 flex-1`} />
        <button className="btn press text-sm">Search</button>
      </form>

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-muted">
            <tr className="border-b border-line bg-paper/60">
              <th scope="col" className="px-5 py-3 font-semibold">Student</th>
              <th scope="col" className="px-5 py-3 font-semibold">BSP</th>
              <th scope="col" className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loadFailed && (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center text-muted">
                  No students match.
                </td>
              </tr>
            )}
            {rows.map((s) => (
              <tr key={s.bsp} className="border-b border-line last:border-0">
                <td className="px-5 py-3">
                  <span className="font-semibold">{s.name ?? "Not set"}</span>
                  <span className="block text-muted">{s.email ?? "Not logged in yet"}</span>
                </td>
                <td className="px-5 py-3">{s.bsp}</td>
                <td className="px-5 py-3">
                  {!s.active ? (
                    <Pill tone="cancelled">disabled</Pill>
                  ) : buyers.has(s.bsp) ? (
                    <Pill tone="delivered">customer</Pill>
                  ) : (
                    <Pill tone="neutral">not ordered</Pill>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        pages={pageCount(studentsRes.count ?? rows.length, PAGE_SIZE)}
        total={studentsRes.count ?? rows.length}
        size={PAGE_SIZE}
        basePath="/admin/students"
        params={{ q: term }}
      />

      <section className={`${card} p-6`} aria-labelledby="allowlist-title">
        <h2 id="allowlist-title" className="text-xl font-bold">
          Manage the allowlist
        </h2>
        <p className="mt-1 text-sm text-muted">Only these students can order. Importing adds to the list; duplicates are ignored.</p>
        <form action={importBsps} className="mt-4 space-y-3">
          <input type="hidden" name="back" value="/admin/students" />
          <label className="block text-sm font-medium" htmlFor="bsps">
            Paste BSP numbers (one per line, or comma-separated)
          </label>
          <textarea id="bsps" name="bsps" rows={5} className={`${field} w-full`} />
          <button className="btn press text-sm">Import</button>
        </form>
        <form action={removeBsp} className="mt-6 flex flex-wrap gap-3 border-t border-line pt-6">
          <input type="hidden" name="back" value="/admin/students" />
          <input name="bsp" placeholder="BSP number to remove" aria-label="BSP number to remove" className={`${field} min-w-56`} />
          <button className="btn-ghost press text-sm">Remove</button>
        </form>
      </section>
    </>
  );
}
