import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CONTACT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact: StickNstay",
  description: "Get in touch with the StickNstay team at IBS Mumbai.",
};

const CHANNELS = [
  { label: "Instagram", value: "Message us", href: CONTACT.instagram, show: CONTACT.instagram },
  { label: "WhatsApp", value: "Chat with us", href: `https://wa.me/${CONTACT.whatsapp}`, show: CONTACT.whatsapp },
  { label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}`, show: CONTACT.email },
].filter((c) => c.show);

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="We reply fast"
          title="Say hi."
          stickers={["07-desi-hinglish/chai-over-everything", "05-self-love-and-good-vibes/choose-joy"]}
        >
          Questions, ideas or a design you want to see? We would love to hear it.
        </PageHero>

        <section className="mx-auto max-w-3xl px-5 py-20">
          {CHANNELS.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2">
              {CHANNELS.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press block rounded-[28px] border border-line bg-surface p-8 shadow-[var(--shadow-card)] hover:bg-accent"
                  >
                    <h2 className="text-2xl font-bold">{c.label}</h2>
                    <p className="mt-1 break-words text-muted">{c.value}</p>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-[28px] border border-line bg-surface p-8 text-center shadow-[var(--shadow-card)]">
              <h2 className="text-2xl font-bold">Find us on campus.</h2>
              <p className="mt-2 text-muted">
                We are IBS Mumbai students, so the easiest way to reach us is in person. You can also add a note when you place an order.
              </p>
            </div>
          )}

          <p className="mt-10 text-center text-muted">
            Asking about an order? Keep your order code handy. Want to buy one?{" "}
            <Link href="/order" className="font-semibold text-link hover:underline">
              Place an order
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
