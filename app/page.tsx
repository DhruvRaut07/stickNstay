import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Sticker } from "@/components/Sticker";
import { DAILY_LIMIT, PRICES } from "@/lib/rules";

const STEPS = [
  ["Verify", "Enter your name, mobile and BSP number. Only IBS Mumbai batchmates can order."],
  ["Choose", "Pick a ready-made design, or upload your own picture for a Custom magnet."],
  ["Pay on delivery", "No payment online. We hand it over and you pay cash."],
] as const;

const MARQUEE = ["custom magnets for your space", "stick it", "stay cute"] as const;

const dot = "radial-gradient(var(--sns-sunshine-deep) 2.5px, transparent 2.5px)";
const cardShadow = "shadow-[0_7px_0_rgba(27,27,47,0.18)]";

const SURFACES: readonly { title: string; text: string; card: string; tilt: string; icon: ReactNode }[] = [
  {
    title: "Fridge",
    text: "The classic. Instant kitchen personality.",
    card: "bg-accent",
    tilt: "-2deg",
    icon: (
      <>
        <rect x="22" y="8" width="36" height="64" rx="7" fill="#fff" />
        <path d="M22 34h36M29 18v8M29 42v14" />
      </>
    ),
  },
  {
    title: "Locker",
    text: "Turn a boring grey door into your own little gallery.",
    card: "bg-surface",
    tilt: "1.5deg",
    icon: (
      <>
        <rect x="12" y="10" width="26" height="60" rx="4" fill="#fff" />
        <rect x="42" y="10" width="26" height="60" rx="4" fill="#fff" />
        <path d="M18 26h14M48 26h14M32 46v6M48 46v6" />
      </>
    ),
  },
  {
    title: "Cupboard",
    text: "Give your hostel almirah a proper glow-up.",
    card: "bg-[#F8C6C6]",
    tilt: "-1.5deg",
    icon: <path d="M14 62V28h52v34M10 62h60M14 28l12-14h28l12 14M30 40v14M50 40v14" fill="#fff" />,
  },
  {
    title: "Whiteboard",
    text: "Pin up goals, memes and memories.",
    card: "bg-[#CFE8D6]",
    tilt: "2deg",
    icon: (
      <>
        <rect x="8" y="14" width="64" height="44" rx="5" fill="#fff" />
        <path d="M28 58l-6 12M52 58l6 12M20 28h22M20 38h34" />
      </>
    ),
  },
];

const PERKS = [
  ["Instant glow-up", "One 5×7 inch magnet turns a plain surface into a little moment that feels like you.", "bg-magnet"],
  ["Zero commitment", "No glue, no nails. Stick it, move it, restick it whenever your mood changes.", "bg-accent"],
  ["Made of you", "Upload a photo, a quote, a meme or an inside joke. We print it exactly as you send it.", "bg-fg"],
] as const;

const PERK_TILT = ["-1.5deg", "1deg", "-1deg"] as const;

const PLANS = [
  ["basic", "Basic", "Ready-made designs, picked by us.", ["5×7 inch magnet sticker", "Choose from our designs", "Ready fast"]],
  ["custom", "Custom", "Your photo, your space.", ["5×7 inch magnet sticker", "Upload any JPG, PNG or WEBP", "Printed exactly as you send it"]],
] as const;

const bigButton =
  "press inline-flex h-14 items-center justify-center gap-2 rounded-full px-9 text-lg font-bold sm:h-[68px] sm:px-11 sm:text-[22px]";

function Tick() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-[22px] flex-none"
      fill="none"
      stroke="var(--sns-magnet-red)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

function Spark() {
  return (
    <svg aria-hidden="true" viewBox="-100 -100 200 200" className="size-[22px] flex-none">
      <path d="M0 -100Q10 -10 100 0Q10 10 0 100Q-10 10 -100 0Q-10 -10 0 -100Z" fill="var(--sns-sunshine)" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* Hero: dotted sunshine band, steel "fridge" panel with real stickers */}
        <section
          className="relative overflow-hidden bg-accent"
          style={{ backgroundImage: dot, backgroundSize: "30px 30px" }}
        >
          <div
            aria-hidden="true"
            className="absolute -bottom-64 -left-48 size-[620px] rounded-full bg-bg opacity-35"
          />
          <div className="relative mx-auto flex max-w-[1280px] flex-col items-center gap-12 px-5 pb-16 pt-12 sm:px-16 sm:pb-20 lg:min-h-[700px] lg:flex-row lg:gap-10">
            <Reveal className="relative z-10 max-w-[660px] flex-1 text-center lg:text-left">
              <p className="inline-block rounded-full bg-bg px-6 py-2.5 text-lg font-semibold">For IBS Mumbai</p>
              <h1 className="mb-6 mt-6 text-[clamp(2.75rem,7vw,5.25rem)] font-bold leading-none tracking-[-0.02em]">
                Make your space look{" "}
                <span className="inline-block -rotate-2 rounded-[26px] bg-fg px-5 text-accent">like you.</span>
              </h1>
              <p className="mx-auto mb-9 max-w-[600px] text-xl leading-normal sm:text-2xl lg:mx-0">
                5×7 inch magnet stickers for your fridge, locker, cupboard or whiteboard. Pick a ready-made design or
                print your own picture. Pay cash when it&apos;s in your hands.
              </p>
              <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
                <Link
                  href="/shop"
                  className={`${bigButton} bg-fg text-bg shadow-[0_6px_0_rgba(0,0,0,0.3)] hover:bg-magnet hover:text-white`}
                >
                  Shop now
                </Link>
                <Link
                  href="/order?variant=custom"
                  className={`${bigButton} border-[3px] border-fg hover:bg-fg hover:text-accent`}
                >
                  Make a custom one
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="w-full max-w-[560px] lg:flex-[0_0_560px]">
              <div
                aria-hidden="true"
                className="relative aspect-[560/620] w-full rotate-2 overflow-hidden rounded-[44px] shadow-[0_14px_0_rgba(27,27,47,0.22),inset_0_0_0_6px_rgba(255,255,255,0.35)]"
                style={{ background: "linear-gradient(135deg, #E3DFD8, #B9B3A9 55%, #9A948A)" }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 2px, rgba(0,0,0,0.03) 2px 4px)",
                  }}
                />
                <div
                  className="absolute right-[5%] top-[14%] h-[37%] w-[3.2%] rounded-xl shadow-[3px_4px_8px_rgba(0,0,0,0.3)]"
                  style={{ background: "linear-gradient(90deg, #F3F4F7, #9EA3AE)" }}
                />
                <div className="absolute inset-x-0 top-[56%] h-1.5 bg-black/15" />
                <Sticker name="01-motivation/dream-big-start-small" tilt={-6} className="absolute left-[2%] top-[2%] w-[54%]" />
                <Sticker name="06-gen-z-and-funny/overthinking-brb" tilt={5} className="absolute left-[40%] top-[34%] w-[54%]" />
                <Sticker name="05-self-love-and-good-vibes/glow-from-within" tilt={-5} className="absolute left-[4%] top-[58%] w-[40%]" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Marquee strip */}
        <div className="overflow-hidden bg-fg py-5 text-[22px] font-bold text-bg sm:text-[26px]" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex flex-none items-center">
                {[0, 1, 2].flatMap((round) =>
                  MARQUEE.map((phrase) => (
                    <span key={`${round}-${phrase}`} className="mr-9 inline-flex items-center gap-9 whitespace-nowrap">
                      {phrase}
                      <Spark />
                    </span>
                  )),
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Video */}
        <section className="mx-auto max-w-[1280px] px-5 pb-6 pt-20 text-center sm:px-16 sm:pt-[110px]">
          <Reveal>
            <h2 className="mb-10 text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-none">See it in action.</h2>
            <div
              className="mx-auto max-w-[900px] rounded-[40px] border-4 border-fg bg-accent p-4 shadow-[0_12px_0_rgba(27,27,47,0.18)] sm:p-8"
              style={{ backgroundImage: dot, backgroundSize: "30px 30px" }}
            >
              <video
                controls
                playsInline
                preload="metadata"
                aria-label="stickNstay sticker drop video with voiceover"
                className="w-full rounded-[24px] border-[3px] border-fg bg-fg"
                src="/sticknstay-sticker-drop-voiceover.mp4#t=0.1"
              >
                Your browser does not support video playback.
              </video>
            </div>
          </Reveal>
        </section>

        {/* Surfaces */}
        <section className="mx-auto max-w-[1280px] px-5 pb-24 pt-20 sm:px-16 sm:pb-[110px] sm:pt-[90px]">
          <Reveal>
            <h2 className="mb-3 text-center text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-none">
              Stick it anywhere magnetic.
            </h2>
            <p className="mb-14 text-center text-xl text-muted sm:text-[22px]">
              If a fridge magnet sticks to it, so will yours.
            </p>
          </Reveal>
          <ul className="grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-[26px]">
            {SURFACES.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <li
                  style={{ rotate: s.tilt }}
                  className={`h-full list-none rounded-[30px] border-[3px] border-fg p-5 sm:px-[26px] sm:py-[30px] ${cardShadow} ${s.card}`}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 80 80"
                    className="size-[74px]"
                    fill="none"
                    stroke="var(--sns-ink)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {s.icon}
                  </svg>
                  <h3 className="mb-2 mt-4 text-[30px] leading-none">{s.title}</h3>
                  <p className="text-lg leading-snug">{s.text}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* Perks */}
        <section className="bg-paper px-5 pb-24 pt-20 sm:px-16 sm:pb-[120px] sm:pt-[110px]">
          <div className="mx-auto max-w-[1152px]">
            <Reveal>
              <h2 className="mb-16 text-center text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-none sm:mb-[70px]">
                Why you&apos;ll love it.
              </h2>
            </Reveal>
            <div className="grid gap-12 md:grid-cols-3 md:gap-9">
              {PERKS.map(([title, text, bar], i) => (
                <Reveal key={title} delay={i * 0.08}>
                  <article
                    style={{ rotate: PERK_TILT[i] }}
                    className="relative h-full rounded-[32px] bg-surface px-[34px] pb-[38px] pt-[54px] shadow-[0_8px_0_rgba(27,27,47,0.1)]"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -top-[18px] left-1/2 size-[38px] -translate-x-1/2 rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.25)]"
                      style={{ background: "radial-gradient(circle at 35% 30%, #fff, #C9CED8 45%, #8A90A0)" }}
                    />
                    <div aria-hidden="true" className={`mb-[22px] h-2 w-14 rounded-full ${bar}`} />
                    <h3 className="mb-3 text-[32px] leading-[1.1]">{title}</h3>
                    <p className="text-[19px] leading-[1.55] text-muted">{text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="prices" className="mx-auto max-w-[1100px] scroll-mt-16 px-5 pb-10 pt-20 sm:px-16 sm:pt-[110px]">
          <Reveal>
            <h2 className="mb-14 text-center text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-none sm:mb-[60px]">
              Two ways to stick.
            </h2>
          </Reveal>
          <div className="grid gap-9 md:grid-cols-2">
            {PLANS.map(([variant, title, blurb, bullets], i) => {
              const custom = variant === "custom";
              return (
                <Reveal key={variant} delay={i * 0.08}>
                  <article
                    className={`flex h-full flex-col rounded-[36px] px-8 py-10 sm:px-10 sm:py-11 ${
                      custom
                        ? "border-[3px] border-fg bg-accent shadow-[0_8px_0_var(--sns-ink)]"
                        : "border-[3px] border-line bg-surface shadow-[0_8px_0_rgba(27,27,47,0.08)]"
                    }`}
                  >
                    <h3 className="mb-1.5 text-4xl">{title}</h3>
                    <p className={`mb-6 text-[19px] ${custom ? "" : "text-muted"}`}>{blurb}</p>
                    <p className="mb-6 text-[76px] font-bold leading-none">
                      ₹{PRICES[variant]}
                      <span className={`ml-1 text-[22px] font-medium ${custom ? "" : "text-muted"}`}>each</span>
                    </p>
                    <ul className="mb-8 flex-1 space-y-3.5">
                      {bullets.map((b) => (
                        <li key={b} className="flex items-center gap-3 text-[19px]">
                          <Tick />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={custom ? "/order?variant=custom" : "/shop"}
                      className={`press inline-flex h-16 w-full items-center justify-center rounded-full text-xl font-bold ${
                        custom
                          ? "bg-fg text-bg hover:bg-magnet hover:text-white"
                          : "bg-accent shadow-[0_5px_0_#C9A23A] hover:bg-accent-deep"
                      }`}
                    >
                      {custom ? "Order Custom" : "Shop ready-made"}
                    </Link>
                  </article>
                </Reveal>
              );
            })}
          </div>
          <p className="mt-8 text-center text-lg text-muted">
            Up to {DAILY_LIMIT} magnets per student per day · Cash on delivery only
          </p>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-[1152px] px-5 pb-20 pt-24 sm:px-16 sm:pb-[90px] sm:pt-[110px]">
          <Reveal>
            <h2 className="mb-20 text-center text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-none">
              How it works.
            </h2>
          </Reveal>
          <ol className="grid gap-14 md:grid-cols-3 md:gap-9">
            {STEPS.map(([title, text], i) => (
              <Reveal key={title} delay={i * 0.08}>
                <li className="relative h-full list-none rounded-[30px] bg-surface px-[30px] pb-[34px] pt-12 shadow-[0_7px_0_rgba(27,27,47,0.1)]">
                  <span
                    aria-hidden="true"
                    className="absolute -top-[30px] left-[30px] grid size-[60px] place-items-center rounded-full bg-fg text-[30px] font-bold text-accent shadow-[0_5px_0_#000]"
                  >
                    {i + 1}
                  </span>
                  <h3 className="mb-2.5 text-[32px] leading-none">{title}</h3>
                  <p className="text-[19px] leading-normal text-muted">{text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          <p className="mt-12 text-center text-xl">
            Got questions?{" "}
            <Link href="/faq" className="font-bold text-link hover:underline">
              Read the FAQ
            </Link>
          </p>
        </section>

        {/* Call to action */}
        <section className="relative overflow-hidden bg-accent px-5 py-20 text-center sm:px-16 sm:py-24">
          <Sticker name="08-doodle-icons/magnet" tilt={-12} className="absolute left-4 top-4 hidden w-20 sm:block lg:left-16 lg:w-28" />
          <Sticker name="08-doodle-icons/star" tilt={12} className="absolute bottom-4 right-4 hidden w-20 sm:block lg:right-16 lg:w-28" />
          <div className="relative">
            <h2 className="mb-9 text-[clamp(2.25rem,6vw,4rem)] font-bold leading-[1.05]">
              Ready to give your <br className="hidden sm:block" />
              corner a glow-up?
            </h2>
            <div className="flex flex-wrap justify-center gap-5">
              <Link
                href="/shop"
                className={`${bigButton} bg-fg text-bg shadow-[0_6px_0_rgba(0,0,0,0.25)] hover:bg-magnet hover:text-white`}
              >
                Shop now
              </Link>
              <Link href="/about" className={`${bigButton} border-[3px] border-fg hover:bg-fg hover:text-accent`}>
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
