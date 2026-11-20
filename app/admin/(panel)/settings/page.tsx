import type { Metadata } from "next";
import { card, ErrorNote, PageHeader } from "@/components/admin/ui";
import { DAILY_LIMIT } from "@/lib/rules";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase";

export const metadata: Metadata = { title: "Settings: StickNstay admin", robots: { index: false } };

// Prices are read from the database everywhere on the site (lib/settings.ts), so they need no check here.
// The daily limit is still fixed in lib/rules.ts and in the order_items constraint (qty 1 to 5).
const ROWS = [
  ["price_basic", "Basic price (₹)", "Shown on the site and charged automatically."],
  ["price_custom", "Custom price (₹)", "Shown on the site and charged automatically."],
  ["daily_limit", "Daily limit (magnets per student)", `The site enforces ${DAILY_LIMIT}. Change lib/rules.ts and the database together.`],
] as const;

export default async function AdminSettingsPage() {
  await requireAdmin();
  const { data, error } = await supabaseAdmin().from("settings").select("key, value").returns<{ key: string; value: number }[]>();
  if (error) console.error("Admin settings load failed", error);
  const live = new Map((data ?? []).map((r) => [r.key, r.value]));
  const limitMismatch = live.has("daily_limit") && live.get("daily_limit") !== DAILY_LIMIT;

  return (
    <>
      <PageHeader title="Settings" description="Live values from the database." />

      {error && <ErrorNote>Couldn&apos;t load settings. Check the Vercel logs.</ErrorNote>}
      {limitMismatch && (
        <ErrorNote>
          Mismatch: the database daily limit is {live.get("daily_limit")} but the site and order forms use {DAILY_LIMIT}.
          Update <code>lib/rules.ts</code> (and the <code>order_items</code> qty constraint) or set the database back to{" "}
          {DAILY_LIMIT}.
        </ErrorNote>
      )}

      <dl className="grid gap-4 sm:grid-cols-3">
        {ROWS.map(([key, label, note]) => (
          <div key={key} className={`${card} p-5`}>
            <dt className="text-sm font-medium text-muted">{label}</dt>
            <dd className="mt-2 text-3xl font-bold">{live.get(key) ?? "?"}</dd>
            <dd className="mt-1 text-xs text-muted">{note}</dd>
          </div>
        ))}
      </dl>

      <p className="max-w-xl text-muted">
        Change a price in the Supabase <code>settings</code> table and the whole site updates on the next page load.
      </p>
    </>
  );
}
