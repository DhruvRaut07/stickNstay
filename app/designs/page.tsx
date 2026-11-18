import type { Metadata } from "next";
import Link from "next/link";
import { Magnet } from "@/components/Magnet";
import { PageHero } from "@/components/PageHero";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PRICES } from "@/lib/rules";

export const metadata: Metadata = {
  title: "Designs: StickNstay",
  description: "Browse ready-made magnet sticker vibes, or upload your own picture for a custom 5×7 inch magnet.",
};

// Placeholder art until real designs exist. Colours come from the brand variables.
const DESIGNS = [
  { name: "Golden Hour", bg: "var(--sns-sunshine-deep)", text: "var(--sns-ink)", tilt: "-3deg" },
  { name: "Main Character", bg: "var(--sns-red-deep)", text: "var(--sns-cream)", tilt: "2deg" },
  { name: "Midnight Study", bg: "var(--sns-ink)", text: "var(--sns-sunshine)", tilt: "-2deg" },
  { name: "Cream Soda", bg: "var(--sns-cream)", text: "var(--sns-ink)", tilt: "3deg" },
  { name: "Soft Launch", bg: "var(--sns-white)", text: "var(--sns-ink)", tilt: "2deg" },
  { name: "Sticky Notes", bg: "var(--sns-sunshine)", text: "var(--sns-ink)", tilt: "-3deg" },
  { name: "Magnet Love", bg: "var(--sns-magnet-red)", text: "var(--sns-white)", tilt: "3deg" },
  { name: "Paper Doodle", bg: "var(--sns-paper)", text: "var(--sns-ink)", tilt: "-2deg" },
] as const;

const CUSTOM_IDEAS = ["Your favourite photo", "A quote you live by", "Your squad", "A meme that never gets old", "Your pet", "A polaroid-style memory"];

export default function DesignsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero eyebrow="Ready-made" title="Pick a vibe.">
          Eight moods to start with, all printed as 5×7 inch magnets. ₹{PRICES.basic} each.
        </PageHero>

        <section className="mx-auto max-w-5xl px-5 py-20">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
            {DESIGNS.map((d) => (
              <li key={d.name}>
                <Magnet tilt={d.tilt} bg={d.bg} text={d.text} title={d.name} label={`${d.name} magnet design`} />
              </li>
            ))}
          </ul>
          <div className="mt-14 text-center">
            <Link href="/order?variant=basic" className="btn press">
              Order a ready-made magnet
            </Link>
            <p className="mt-4 text-sm text-muted">More designs are on the way.</p>
          </div>
        </section>

        <section className="bg-paper">
          <div className="mx-auto max-w-5xl px-5 py-20">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <h2 className="headline">Make it yours.</h2>
                <p className="mt-4 text-lg">
                  Upload any JPG, PNG or WEBP and we print it exactly as you send it. ₹{PRICES.custom} each.
                </p>
                <Link href="/order?variant=custom" className="btn-ink press mt-8">
                  Order a custom magnet
                </Link>
              </div>
              <ul className="flex flex-wrap gap-3">
                {CUSTOM_IDEAS.map((idea, i) => (
                  <li
                    key={idea}
                    className="rounded-full border border-line bg-surface px-5 py-2 font-semibold shadow-[var(--shadow-card)]"
                    style={{ transform: `rotate(${i % 2 ? 2 : -2}deg)` }}
                  >
                    {idea}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
