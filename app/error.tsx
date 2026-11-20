"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Last-resort screen for any page that throws. The digest matches the server log entry. */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error ? (error as Error & { digest?: string }).digest : undefined;

  useEffect(() => {
    console.error("Page error", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
      <h1 className="headline">Oops, that didn&apos;t load.</h1>
      <p className="mt-3 text-lg text-muted">
        Something went wrong on our side. Try again, or head back to the shop.
      </p>
      {digest && <p className="mt-2 text-sm text-muted">Reference: {digest}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className="btn press">
          Try again
        </button>
        <Link href="/" className="btn-ghost press">
          Back to home
        </Link>
      </div>
    </main>
  );
}
