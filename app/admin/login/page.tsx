import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { safeAdminPath } from "@/lib/admin-schemas";
import { getAdmin } from "@/lib/supabase";
import { login } from "../actions";

export const metadata: Metadata = { title: "Admin login: StickNstay", robots: { index: false } };

const field =
  "w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-base transition focus:border-fg";

type Props = { searchParams: Promise<{ error?: string; next?: string; signedout?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error, next, signedout } = await searchParams;
  const target = safeAdminPath(next);
  if (await getAdmin()) redirect(target);

  const problem =
    error === "rate"
      ? "Too many attempts. Try again in a few minutes."
      : error === "session"
        ? "Your session expired. Please sign in again."
        : error
          ? "Those details didn't work."
          : null;

  return (
    <div className="grid min-h-screen flex-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="hidden flex-col justify-between bg-fg p-12 md:flex">
        <Logo on="dark" className="h-10" />
        <div>
          <p className="text-4xl font-bold leading-tight text-bg">
            Run the drop,
            <br />
            <span className="text-accent">one order at a time.</span>
          </p>
          <p className="mt-4 max-w-sm text-bg/70">Orders, products and students for the IBS Mumbai magnet shop.</p>
        </div>
        <p className="text-sm text-bg/50">stickNstay admin</p>
      </aside>

      <main className="flex items-center justify-center bg-paper px-5 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden">
            <Logo className="h-9" />
          </div>
          <h1 className="text-3xl font-bold">Sign in</h1>
          <p className="mt-2 text-muted">Admin access only.</p>

          {signedout && !problem && (
            <p role="status" className="mt-6 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-semibold">
              You&apos;ve been signed out.
            </p>
          )}
          {problem && (
            <p role="alert" className="mt-6 rounded-xl border border-magnet/40 bg-magnet/10 px-4 py-3 text-sm font-semibold text-link">
              {problem}
            </p>
          )}

          <form action={login} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={target} />
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Email</span>
              <input name="email" type="email" autoComplete="username" required className={field} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Password</span>
              <input name="password" type="password" autoComplete="current-password" required className={field} />
            </label>
            <button className="btn press w-full">Sign in</button>
          </form>
        </div>
      </main>
    </div>
  );
}
