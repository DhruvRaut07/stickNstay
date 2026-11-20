"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Admin screens that fail to load show this instead of the generic page error. */
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error ? (error as Error & { digest?: string }).digest : undefined;

  useEffect(() => {
    console.error("Admin error", error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-xl px-5 py-16 text-center">
      <h1 className="headline">Admin couldn&apos;t load.</h1>
      <p className="mt-3 text-muted">
        Usually a database or key problem. Check the Vercel runtime logs
        {digest ? ` for reference ${digest}` : ""}.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className="btn press">
          Try again
        </button>
        <Link href="/admin" className="btn-ghost press">
          Orders
        </Link>
      </div>
    </main>
  );
}
