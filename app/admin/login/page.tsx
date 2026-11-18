import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/supabase";
import { login } from "../actions";

export const metadata: Metadata = { title: "Admin login: StickNstay", robots: { index: false } };

const field =
  "w-full rounded-2xl border border-line bg-surface px-4 py-3.5 text-base transition focus:border-fg";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-20">
      <h1 className="headline">Admin</h1>
      <p className="mt-2 text-muted">Sign in to manage StickNstay orders.</p>

      <form action={login} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email</span>
          <input name="email" type="email" autoComplete="username" required className={field} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Password</span>
          <input name="password" type="password" autoComplete="current-password" required className={field} />
        </label>
        {error && (
          <p role="alert" className="text-sm font-medium text-link">
            {error === "rate"
              ? "Too many attempts. Try again in a few minutes."
              : "Those details didn't work."}
          </p>
        )}
        <button className="btn press w-full">
          Sign in
        </button>
      </form>
    </main>
  );
}
