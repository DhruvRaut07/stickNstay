"use client";

import { useEffect, useState } from "react";

const SHOW_MS = 4500;

/** Top-of-viewport toast: slides in, stays a few seconds, slides out, then unmounts. */
export function Toast({ title, detail }: { title: string; detail?: string }) {
  const [phase, setPhase] = useState<"hidden" | "shown" | "gone">("hidden");

  useEffect(() => {
    const enter = requestAnimationFrame(() => setPhase("shown"));
    const leave = setTimeout(() => setPhase("hidden"), SHOW_MS);
    const unmount = setTimeout(() => setPhase("gone"), SHOW_MS + 400);
    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(leave);
      clearTimeout(unmount);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      role="status"
      className={`fixed left-1/2 top-4 z-[60] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-full bg-fg py-3 pl-3 pr-6 text-left text-bg shadow-[0_10px_30px_rgba(27,27,47,0.3)] transition-all duration-300 ease-out ${
        phase === "shown" ? "translate-y-0 opacity-100" : "-translate-y-[150%] opacity-0"
      }`}
    >
      <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-lg font-bold text-accent-fg">
        ✓
      </span>
      <span className="min-w-0">
        <strong className="block leading-tight">{title}</strong>
        {detail && <span className="block truncate text-sm opacity-80">{detail}</span>}
      </span>
    </div>
  );
}
