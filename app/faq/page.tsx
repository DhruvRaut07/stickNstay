import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { DAILY_LIMIT, PRICES } from "@/lib/rules";

export const metadata: Metadata = {
  title: "FAQ: StickNstay",
  description: "Answers about StickNstay magnet stickers: surfaces, sizes, custom images, payment and ordering.",
};

const FAQ: readonly (readonly [string, string])[] = [
  ["What exactly is a stickNstay magnet?", "A 5×7 inch magnet sticker. Put it on a magnetic surface to add colour, personality or a favourite memory to your space."],
  ["Where can I stick it?", "Anywhere magnetic: fridges, steel lockers, hostel cupboards, magnetic whiteboards and metal shelves. It will not stick to wood, glass, plain walls or non-magnetic metals like aluminium. Quick test: if a regular fridge magnet sticks there, ours will too."],
  ["Will it damage my surface?", "There is no glue and nothing to peel, so you can move it or take it off whenever you like."],
  ["What is the difference between Basic and Custom?", `Basic (₹${PRICES.basic}) is a ready-made design that we pick for you. Custom (₹${PRICES.custom}) is printed from your own image.`],
  ["What image should I upload for a Custom magnet?", "A JPG, PNG or WEBP up to 10 MB. Sharper images print better, and portrait photos fit the 5×7 shape best. We print it exactly as you send it."],
  ["How do I pay?", "Cash on delivery only. There is no online payment. You pay when the magnet is in your hands."],
  ["Who can order?", "IBS Mumbai batchmates. We check the BSP number you enter against our list of verified students."],
  ["How many can I order?", `Up to ${DAILY_LIMIT} magnets per student per day.`],
  ["How and when will I get my order?", "After you place an order we contact you on the mobile number you gave to arrange the handover. Save your order code, because you will need it at delivery."],
  ["I made a mistake in my order. What now?", "Get in touch with your order code and we will sort it out."],
];

export default function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Good to know"
          title="Questions? Answered."
          stickers={["04-study-mode/focus-mode-on", "07-desi-hinglish/sab-badhiya"]}
        >
          Everything about surfaces, sizes, custom images and ordering.
        </PageHero>

        <section className="mx-auto max-w-3xl px-5 py-20">
          <div className="space-y-4">
            {FAQ.map(([q, a]) => (
              <details
                key={q}
                className="group rounded-[28px] border border-line bg-surface shadow-[var(--shadow-card)]"
              >
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 p-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span aria-hidden className="text-3xl leading-none text-magnet transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-muted">{a}</p>
              </details>
            ))}
          </div>
          <p className="mt-10 text-center">
            Still curious?{" "}
            <Link href="/contact" className="font-semibold text-link hover:underline">
              Contact us
            </Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
