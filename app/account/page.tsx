import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/app/login/actions";
import { AccountNav } from "@/components/AccountNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { DAILY_LIMIT } from "@/lib/rules";
import { requireStudent } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export const metadata: Metadata = { title: "Account: StickNstay", robots: { index: false } };

const isoHoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60_000).toISOString();
const istDay = (iso: string | Date) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export default async function AccountPage() {
  const student = await requireStudent("/account");
  const db = supabaseAdmin();
  const since = isoHoursAgo(48);

  const [{ data: profile }, { data: recent }] = await Promise.all([
    db.from("bsp_allowlist").select("division, email").eq("bsp", student.bsp).maybeSingle(),
    db.from("orders").select("qty, status, created_at").eq("bsp", student.bsp).gte("created_at", since),
  ]);

  const today = istDay(new Date());
  const used = (recent ?? [])
    .filter((o) => o.status !== "cancelled" && istDay(o.created_at) === today)
    .reduce((sum, o) => sum + o.qty, 0);
  const left = Math.max(DAILY_LIMIT - used, 0);

  const details = [
    ["Name", student.name],
    ["BSP number", student.bsp],
    ["Division", profile?.division ?? "-"],
    ["College email", profile?.email ?? "-"],
  ] as const;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-5 sm:py-12">
        <h1 className="headline">Your account.</h1>
        <div className="mt-6">
          <AccountNav active="account" />
        </div>

        <section aria-labelledby="details-heading" className="mt-8 rounded-[28px] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 id="details-heading" className="text-xl font-bold">
            Your details
          </h2>
          <dl className="mt-4 divide-y divide-dashed divide-line">
            {details.map(([term, value]) => (
              <div key={term} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <dt className="text-muted">{term}</dt>
                <dd className="break-all font-semibold sm:text-right">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-sm text-muted">
            Something wrong?{" "}
            <Link href="/contact" className="font-semibold text-link hover:underline">
              Contact us
            </Link>{" "}
            and we&apos;ll fix it.
          </p>
        </section>

        <section aria-labelledby="limit-heading" className="mt-6 rounded-[28px] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 id="limit-heading" className="text-xl font-bold">
            Today&apos;s limit
          </h2>
          <p className="mt-1 text-muted">
            {used} of {DAILY_LIMIT} magnets ordered today. {left > 0 ? `${left} left.` : "Come back tomorrow!"}
          </p>
          <div
            role="progressbar"
            aria-label="Magnets ordered today"
            aria-valuemin={0}
            aria-valuemax={DAILY_LIMIT}
            aria-valuenow={used}
            className="mt-4 h-3 overflow-hidden rounded-full bg-paper"
          >
            <div className="h-full rounded-full bg-fg" style={{ width: `${(used / DAILY_LIMIT) * 100}%` }} />
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/account/orders" className="btn press">
            View my orders
          </Link>
          <form action={logout}>
            <button className="btn-ghost press">Log out</button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
