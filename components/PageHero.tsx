import type { ReactNode } from "react";
import { Sticker } from "./Sticker";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  /** Optional sticker names (see Sticker) shown at the left and right edge from md up. */
  stickers?: readonly [string, string];
};

/** Sunshine band that opens every inner page. */
export function PageHero({ eyebrow, title, children, stickers }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-accent">
      {stickers && (
        <>
          <Sticker name={stickers[0]} tilt={-8} className="absolute -left-6 top-1/2 hidden w-44 -translate-y-1/2 md:block lg:left-6 lg:w-52" />
          <Sticker name={stickers[1]} tilt={8} className="absolute -right-6 top-1/2 hidden w-44 -translate-y-1/2 md:block lg:right-6 lg:w-52" />
        </>
      )}
      <div className="relative mx-auto max-w-5xl px-5 pb-16 pt-14 text-center sm:pt-20">
        <p className="tilt mb-4 rounded-full bg-bg px-4 py-1.5 text-sm font-semibold">{eyebrow}</p>
        <h1 className="display mx-auto max-w-3xl">{title}</h1>
        {children && <p className="mx-auto mt-5 max-w-xl text-lg sm:text-xl">{children}</p>}
      </div>
    </section>
  );
}
