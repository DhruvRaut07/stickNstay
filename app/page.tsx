import Link from "next/link";
import { Magnet } from "@/components/Magnet";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { DAILY_LIMIT, PRICES } from "@/lib/rules";

const STEPS = [
  ["Verify", "Enter your name, mobile and BSP number. Only IBS Mumbai batchmates can order."],
  ["Choose", "Pick a ready-made design, or upload your own picture for a Custom magnet."],
  ["Pay on delivery", "No payment online. We hand it over and you pay cash."],
] as const;

const SURFACES = [
  ["Fridge", "The classic. Instant kitchen personality."],
  ["Locker", "Turn a boring grey door into your own little gallery."],
  ["Cupboard", "Give your hostel almirah a proper glow-up."],
  ["Whiteboard", "Pin up goals, memes and memories."],
] as const;

const PERKS = [
  ["Instant glow-up", "One 5×7 inch magnet turns a plain surface into a little moment that feels like you."],
  ["Zero commitment", "No glue, no nails. Stick it, move it, restick it whenever your mood changes."],
  ["Made of you", "Upload a photo, a quote, a meme or an inside joke. We print it exactly as you send it."],
] as const;

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="bg-accent">
          <div className="mx-auto max-w-5xl px-5 pb-20 pt-16 text-center sm:pt-24">
            <Reveal>
              <p className="tilt mb-4 rounded-full bg-bg px-4 py-1.5 text-sm font-semibold">
                For IBS Mumbai batchmates
              </p>
              <h1 className="display mx-auto max-w-3xl">Make your space look like you.</h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed sm:text-xl">
                5×7 inch magnet stickers for your fridge, locker, cupboard or whiteboard. Pick a
                ready-made design or print your own picture. Pay cash when it&apos;s in your hands.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link href="/order" className="btn-ink press">
                  Order now
                </Link>
                <Link href="/designs" className="btn-ghost press">
                  Browse designs ›
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="mx-auto mt-16 grid max-w-xl grid-cols-3 items-end gap-5">
              <Magnet tilt="-6deg" bg="var(--sns-magnet-red)" text="var(--sns-white)" label="Sample magnet design one" />
              <div className="-translate-y-6">
                <Magnet tilt="0deg" bg="var(--sns-ink)" text="var(--sns-sunshine)" label="Sample magnet design two" />
              </div>
              <Magnet tilt="6deg" bg="var(--sns-white)" text="var(--sns-ink)" label="Sample magnet design three" />
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-20">
          <Reveal>
            <h2 className="headline text-center">Stick it anywhere magnetic.</h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-lg text-muted">
              If a fridge magnet sticks to it, so will yours.
            </p>
          </Reveal>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SURFACES.map(([title, text], i) => (
              <Reveal key={title} delay={i * 0.06}>
                <li className="h-full list-none rounded-[28px] border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
                  <h3>{title}</h3>
                  <p className="mt-2 text-muted">{text}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="bg-paper">
          <div className="mx-auto max-w-5xl px-5 py-20">
            <Reveal>
              <h2 className="headline text-center">Why you&apos;ll love it.</h2>
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {PERKS.map(([title, text], i) => (
                <Reveal key={title} delay={i * 0.08}>
                  <article className="h-full rounded-[28px] border border-line bg-surface p-8 shadow-[var(--shadow-card)]">
                    <h3>{title}</h3>
                    <p className="mt-3 text-muted">{text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="prices" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-20">
          <Reveal>
            <h2 className="headline text-center">Two ways to stick.</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {(
              [
                ["basic", "Basic", "Ready-made designs, picked by us.", ["5×7 inch magnet sticker", "Choose from our designs", "Ready fast"]],
                ["custom", "Custom", "Your photo, your space.", ["5×7 inch magnet sticker", "Upload any JPG, PNG or WEBP", "Printed exactly as you send it"]],
              ] as const
            ).map(([variant, title, blurb, bullets], i) => (
              <Reveal key={variant} delay={i * 0.08}>
                <article className="flex h-full flex-col rounded-[28px] border border-line bg-surface p-8 shadow-[var(--shadow-card)]">
                  <h3>{title}</h3>
                  <p className="mt-1 text-muted">{blurb}</p>
                  <p className="mt-6 text-5xl font-bold">
                    ₹{PRICES[variant]}
                    <span className="ml-1 text-base font-medium text-muted">each</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-2 text-[15px] text-muted">
                    {bullets.map((b) => (
                      <li key={b}>
                        <span aria-hidden className="font-bold text-magnet">✓</span> {b}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/order?variant=${variant}`} className="btn press mt-8">
                    Order {title}
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            Up to {DAILY_LIMIT} magnets per student per day · Cash on delivery only
          </p>
        </section>

        <section className="bg-paper">
          <div className="mx-auto max-w-5xl px-5 py-20">
            <Reveal>
              <h2 className="headline text-center">How it works.</h2>
            </Reveal>
            <ol className="mt-12 grid gap-10 sm:grid-cols-3">
              {STEPS.map(([title, text], i) => (
                <Reveal key={title} delay={i * 0.08}>
                  <li className="list-none text-center sm:text-left">
                    <span className="tilt rounded-full bg-accent px-3 py-0.5 text-sm font-semibold">Step {i + 1}</span>
                    <h3 className="mt-2">{title}</h3>
                    <p className="mt-2 text-muted">{text}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
            <p className="mt-10 text-center">
              Got questions?{" "}
              <Link href="/faq" className="font-semibold text-link hover:underline">
                Read the FAQ
              </Link>
            </p>
          </div>
        </section>

        <section className="bg-accent">
          <div className="mx-auto max-w-5xl px-5 py-16 text-center">
            <h2 className="headline">Ready to give your corner a glow-up?</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/order" className="btn-ink press">
                Order now
              </Link>
              <Link href="/about" className="btn-ghost press">
                Our story
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
