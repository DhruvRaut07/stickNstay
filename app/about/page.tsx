import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AboutHeroArt } from "@/components/AboutHeroArt";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TEAM } from "@/lib/site";

export const metadata: Metadata = {
  title: "About: StickNstay",
  description: "StickNstay is a student-run magnet sticker brand from IBS Mumbai. Small things that make your space yours.",
};

const iconProps = {
  "aria-hidden": true,
  viewBox: "0 0 80 80",
  fill: "none",
  stroke: "#1B1B2F",
  strokeWidth: 3.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-[84px]",
} as const;

const PLACES: readonly { label: string; card: string; tilt: string; icon: ReactNode }[] = [
  {
    label: "Fridge doors",
    card: "bg-accent",
    tilt: "-2deg",
    icon: (
      <svg {...iconProps}>
        <rect x="22" y="8" width="36" height="64" rx="7" fill="#fff" />
        <path d="M22 34h36M29 18v8M29 42v14" />
      </svg>
    ),
  },
  {
    label: "Steel lockers",
    card: "bg-bg",
    tilt: "1.5deg",
    icon: (
      <svg {...iconProps}>
        <rect x="12" y="10" width="26" height="60" rx="4" fill="#fff" />
        <rect x="42" y="10" width="26" height="60" rx="4" fill="#fff" />
        <path d="M18 26h14M48 26h14M32 46v6M48 46v6" />
      </svg>
    ),
  },
  {
    label: "Hostel cupboards",
    card: "bg-[#F8C6C6]",
    tilt: "-1.5deg",
    icon: (
      <svg {...iconProps}>
        <path d="M14 62V28h52v34M10 62h60M14 28l12-14h28l12 14M30 40v14M50 40v14" fill="#fff" />
      </svg>
    ),
  },
  {
    label: "Magnetic whiteboards",
    card: "bg-bg",
    tilt: "2deg",
    icon: (
      <svg {...iconProps}>
        <rect x="8" y="14" width="64" height="44" rx="5" fill="#fff" />
        <path d="M28 58l-6 12M52 58l6 12M20 28h22M20 38h34" />
      </svg>
    ),
  },
];

const VALUES: readonly { title: string; text: string; bar: string; tilt: string }[] = [
  {
    title: "Made for your vibe",
    text: "Every corner can look like you. We make the small pieces that get it there.",
    bar: "bg-magnet",
    tilt: "-1.5deg",
  },
  {
    title: "Easy to love",
    text: "No glue, no nails, no stress. Stick it, move it, restick it whenever your mood changes.",
    bar: "bg-accent",
    tilt: "1deg",
  },
  {
    title: "Student-run, campus-first",
    text: "Built by IBS Mumbai students, for IBS Mumbai students. Simple prices, cash on delivery.",
    bar: "bg-fg",
    tilt: "-1deg",
  },
];

/** The silver magnet "pin" that sits on the top edge of a card. */
function Pin({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff,#c9ced8_45%,#8a90a0)] ${className}`}
    />
  );
}

const sectionTitle = "font-bold leading-none text-[clamp(2.25rem,5vw,3.75rem)]";
const bigButton =
  "inline-flex h-[68px] items-center justify-center whitespace-nowrap rounded-full px-8 text-xl font-bold transition motion-reduce:transition-none sm:px-11 sm:text-[22px]";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="overflow-hidden">
        {/* Hero */}
        <section className="dotted-board relative flex min-h-[660px] flex-wrap items-center gap-y-4 overflow-hidden px-5 py-14 sm:px-16 sm:py-0">
          <div aria-hidden="true" className="absolute -right-40 -top-44 size-[640px] rounded-full bg-bg opacity-40" />
          <div className="relative z-[2] max-w-full flex-[0_0_560px]">
            <span className="inline-block rounded-full bg-bg px-6 py-2.5 text-lg font-semibold">Our story</span>
            <h1 className="mb-5 mt-6 text-[clamp(2.75rem,9vw,5.5rem)] font-bold leading-[0.98] tracking-tight">
              Hi, we&apos;re{" "}
              <span className="inline-block -rotate-2 rounded-3xl bg-fg px-4 text-surface sm:px-[18px]">
                stickNstay.
              </span>
            </h1>
            <p className="max-w-[500px] text-xl leading-[1.4] sm:text-[28px]">
              A small brand with one big idea: your space should feel like you.
            </p>
          </div>
          <AboutHeroArt />
        </section>

        {/* Where it started */}
        <section className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-12 px-5 pb-16 pt-16 sm:px-16 sm:pb-[90px] sm:pt-[120px] lg:gap-20">
          <div className="flex-[1_1_420px]">
            <h2 className={`mb-8 ${sectionTitle}`}>Where it started.</h2>
            <p className="mb-5 text-xl leading-[1.65] sm:text-[22px]">
              stickNstay began as a marketing project at IBS Mumbai. The brief was simple: build a real product and
              sell it on campus. We picked magnet stickers because they are small, personal and instantly make a plain
              surface feel like yours.
            </p>
            <p className="text-xl leading-[1.65] sm:text-[22px]">
              Fridge doors, steel lockers, hostel cupboards, magnetic whiteboards: if a magnet sticks, it can hold a
              little piece of your personality. Pick a ready-made design, or print your own photo, quote or inside joke
              at 5×7 inches.
            </p>
          </div>

          <div aria-hidden="true" className="relative mx-auto h-[360px] w-full max-w-[440px] sm:h-[460px] sm:flex-[0_0_440px]">
            <div className="absolute left-1/2 top-0 h-[460px] w-[440px] origin-top -translate-x-1/2 scale-[0.78] sm:scale-100">
              <div className="absolute left-2.5 top-[30px] size-[380px] rounded-full bg-accent" />
              <div className="absolute left-[46px] top-[70px] flex h-[236px] w-[330px] -rotate-5 flex-col items-center justify-center gap-1.5 rounded-[18px] border-[3px] border-fg bg-surface shadow-[0_14px_0_rgba(27,27,47,0.14)]">
                <span className="text-[96px] font-bold leading-none">5×7</span>
                <span className="text-[26px] font-semibold text-magnet">inches</span>
              </div>
              <Pin className="left-[150px] top-[44px] size-11 shadow-[0_5px_9px_rgba(0,0,0,0.3)]" />
              <div className="absolute left-[230px] top-[300px] max-w-[210px] rotate-6 rounded-[22px] bg-fg px-[26px] py-4 text-[26px] font-bold leading-snug text-accent shadow-[0_6px_0_rgba(0,0,0,0.2)]">
                your photo, quote or inside joke
              </div>
            </div>
          </div>
        </section>

        {/* If a magnet sticks */}
        <section className="bg-fg px-5 pb-20 pt-[72px] sm:px-16 sm:pb-[100px] sm:pt-[90px]">
          <div className="mx-auto max-w-[1152px]">
            <h2 className="mb-3.5 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.05] text-bg">
              If a magnet sticks, it&apos;s yours.
            </h2>
            <p className="mb-12 text-xl text-accent sm:text-[22px]">A little piece of your personality, anywhere.</p>
            <ul className="grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-7">
              {PLACES.map((place) => (
                <li
                  key={place.label}
                  style={{ rotate: place.tilt }}
                  className={`flex flex-col gap-4 rounded-[28px] border-[3px] border-fg p-5 shadow-[0_6px_0_rgba(27,27,47,0.14)] sm:gap-[18px] sm:px-6 sm:pb-[26px] sm:pt-7 ${place.card}`}
                >
                  {place.icon}
                  <p className="text-xl font-bold leading-[1.1] sm:text-[26px]">{place.label}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* What we care about */}
        <section className="bg-paper px-5 pb-24 pt-20 sm:px-16 sm:pb-[120px] sm:pt-[110px]">
          <div className="mx-auto max-w-[1152px]">
            <h2 className={`mb-14 text-center sm:mb-[70px] ${sectionTitle}`}>What we care about.</h2>
            <div className="grid gap-12 md:grid-cols-3 md:gap-9">
              {VALUES.map((value) => (
                <article
                  key={value.title}
                  style={{ rotate: value.tilt }}
                  className="relative rounded-[32px] bg-surface px-[34px] pb-[38px] pt-[54px] shadow-[0_8px_0_rgba(27,27,47,0.1)]"
                >
                  <Pin className="-top-[18px] left-1/2 size-[38px] -translate-x-1/2 shadow-[0_4px_8px_rgba(0,0,0,0.25)]" />
                  <div aria-hidden="true" className={`mb-[22px] h-2 w-14 rounded-full ${value.bar}`} />
                  <h3 className="mb-3 text-[32px] leading-[1.1]">{value.title}</h3>
                  <p className="text-[19px] leading-[1.55] text-muted">{value.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {TEAM.length > 0 && (
          <section className="bg-bg px-5 py-20 sm:px-16">
            <div className="mx-auto max-w-[1152px]">
              <h2 className={`text-center ${sectionTitle}`}>The team.</h2>
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
            </div>
          </section>
        )}

        {/* Call to action */}
        <section className="bg-accent px-5 py-20 text-center sm:px-16 sm:py-24">
          <h2 className="mb-9 text-[clamp(2.25rem,6vw,4rem)] font-bold leading-[1.05]">
            Ready to give your <br className="hidden sm:block" />
            corner a glow-up?
          </h2>
          <div className="flex flex-wrap justify-center gap-5">
            <Link
              href="/shop"
              className={`${bigButton} bg-fg text-bg shadow-[0_6px_0_rgba(0,0,0,0.25)] hover:bg-magnet`}
            >
              Shop now
            </Link>
            <Link
              href="/order?variant=custom"
              className={`${bigButton} border-[3px] border-fg hover:bg-fg hover:text-accent`}
            >
              Make a custom one
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
