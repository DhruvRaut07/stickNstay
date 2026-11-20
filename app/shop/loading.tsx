import { PageHero } from "@/components/PageHero";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const bone = "bg-line/60 motion-safe:animate-pulse";

/** Shown instantly while /shop reads the catalog, same shape as the real page. */
export default function ShopLoading() {
  return (
    <>
      <SiteHeader />
      <main aria-busy="true">
        <PageHero eyebrow="Shop" title="Pick your magnet.">
          Loading designs…
        </PageHero>

        <section className="mx-auto max-w-5xl px-5 py-16">
          <div className="flex flex-wrap gap-3" aria-hidden="true">
            {[88, 72, 120, 130, 130].map((w, i) => (
              <div key={i} className={`h-11 rounded-full ${bone}`} style={{ width: w }} />
            ))}
          </div>

          <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i} className="flex flex-col">
                <div className={`aspect-square w-full rounded-[28px] ${bone}`} />
                <div className={`mt-4 h-3 w-1/3 rounded-full ${bone}`} />
                <div className={`mt-2 h-4 w-3/4 rounded-full ${bone}`} />
                <div className={`mt-2 h-4 w-1/2 rounded-full ${bone}`} />
                <div className={`mt-3 h-11 w-full rounded-full ${bone}`} />
              </li>
            ))}
          </ul>
          <p className="sr-only" role="status">
            Loading the shop
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
