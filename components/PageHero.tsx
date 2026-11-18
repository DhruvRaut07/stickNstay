import type { ReactNode } from "react";

/** Sunshine band that opens every inner page. */
export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="bg-accent">
      <div className="mx-auto max-w-5xl px-5 pb-16 pt-14 text-center sm:pt-20">
        <p className="tilt mb-4 rounded-full bg-bg px-4 py-1.5 text-sm font-semibold">{eyebrow}</p>
        <h1 className="display mx-auto max-w-3xl">{title}</h1>
        {children && <p className="mx-auto mt-5 max-w-xl text-lg sm:text-xl">{children}</p>}
      </div>
    </section>
  );
}
