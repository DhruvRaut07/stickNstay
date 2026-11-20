import type { Metadata } from "next";
import { AdminNav } from "@/components/AdminNav";
import { DAILY_LIMIT, PRICES } from "@/lib/rules";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase";

export const metadata: Metadata = { title: "Settings: StickNstay admin", robots: { index: false } };

// ponytail: read-only on purpose. The site shows prices and the daily limit from lib/rules.ts in ~12
// places, so editing the database alone would charge one amount and display another.
const EXPECTED = [
  ["price_basic", "Basic price (₹)", PRICES.basic],
  ["price_custom", "Custom price (₹)", PRICES.custom],
  ["daily_limit", "Daily limit (magnets per student)", DAILY_LIMIT],
] as const;

export default async function AdminSettingsPage() {
  await requireAdmin();
  const { data, error } = await supabaseAdmin().from("settings").select("key, value").returns<{ key: string; value: number }[]>();
  if (error) console.error("Admin settings load failed", error);
  const live = new Map((data ?? []).map((r) => [r.key, r.value]));
  const mismatches = EXPECTED.filter(([key, , shown]) => live.has(key) && live.get(key) !== shown);

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10">
      <AdminNav />
      <h1 className="headline mt-8">Settings</h1>

      {error && (
        <p role="alert" className="mt-4 font-medium text-link">
          Couldn&apos;t load settings. Check the Vercel logs.
        </p>
      )}
      {mismatches.length > 0 && (
        <p role="alert" className="mt-4 rounded-2xl bg-accent p-4 text-sm font-medium">
          Mismatch: the database charges a different value than the site shows for{" "}
          {mismatches.map(([, label]) => label).join(", ")}. Update <code>lib/rules.ts</code> or the database so they
          agree.
        </p>
      )}

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        {EXPECTED.map(([key, label, shown]) => (
          <div key={key} className="rounded-[28px] border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="mt-1 text-3xl font-bold">{live.get(key) ?? "?"}</dd>
            <dd className="mt-1 text-xs text-muted">Site shows {shown}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-8 max-w-xl text-muted">
        These are read-only here. To change a price or the limit, update the <code>settings</code> table and{" "}
        <code>lib/rules.ts</code> together, then redeploy.
      </p>
    </main>
  );
}
