import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TEAM } from "@/lib/site";

export const metadata: Metadata = {
  title: "About: StickNstay",
  description: "StickNstay is a student-run magnet sticker brand from IBS Mumbai. Small things that make your space yours.",
};

const VALUES = [
  ["Made for your vibe", "Every corner can look like you. We make the small pieces that get it there."],
  ["Easy to love", "No glue, no nails, no stress. Stick it, move it, restick it whenever your mood changes."],
  ["Student-run, campus-first", "Built by IBS Mumbai students, for IBS Mumbai students. Simple prices, cash on delivery."],
] as const;

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero eyebrow="Our story" title="Hi, we're stickNstay.">
          A small brand with one big idea: your space should feel like you.
        </PageHero>

        <section className="mx-auto max-w-3xl space-y-5 px-5 py-20 text-lg">
          <h2 className="headline">Where it started.</h2>
          <p>
            stickNstay began as a marketing project at IBS Mumbai. The brief was simple: build a
            real product and sell it on campus. We picked magnet stickers because they are small,
            personal and instantly make a plain surface feel like yours.
          </p>
          <p>
            Fridge doors, steel lockers, hostel cupboards, magnetic whiteboards: if a magnet sticks,
            it can hold a little piece of your personality. Pick a ready-made design, or print your
            own photo, quote or inside joke at 5×7 inches.
          </p>
        </section>

        <section className="bg-paper">
          <div className="mx-auto max-w-5xl px-5 py-20">
            <h2 className="headline text-center">What we care about.</h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {VALUES.map(([title, text]) => (
                <article
                  key={title}
                  className="rounded-[28px] border border-line bg-surface p-8 shadow-[var(--shadow-card)]"
                >
                  <h3>{title}</h3>
                  <p className="mt-3 text-muted">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {TEAM.length > 0 && (
          <section className="mx-auto max-w-5xl px-5 py-20">
            <h2 className="headline text-center">The team.</h2>
            <ul className="mt-12 grid gap-6 sm:grid-cols-3">
              {TEAM.map((m) => (
                <li
                  key={m.name}
                  className="rounded-[28px] border border-line bg-surface p-6 text-center shadow-[var(--shadow-card)]"
                >
                  <p className="text-xl font-bold">{m.name}</p>
                  <p className="text-muted">{m.role}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="bg-accent">
          <div className="mx-auto max-w-5xl px-5 py-16 text-center">
            <h2 className="headline">Ready to give your corner a glow-up?</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/order" className="btn-ink press">
                Order now
              </Link>
              <Link href="/designs" className="btn-ghost press">
                Browse designs
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
