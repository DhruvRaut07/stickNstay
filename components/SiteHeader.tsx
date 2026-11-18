import Link from "next/link";
import { NAV_LINKS } from "@/lib/site";
import { Logo } from "./Logo";

const linkClass =
  "inline-flex min-h-11 items-center rounded-full px-4 font-semibold hover:bg-accent";

export function SiteHeader() {
  return (
    <header className="glass sticky top-0 z-50">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5">
        <Link href="/" aria-label="stickNstay home" className="py-2">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={linkClass}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link href="/order" className="btn press">
            Order
          </Link>
          {/* Native disclosure: works without JavaScript. */}
          <details className="relative md:hidden">
            <summary className="btn-ghost press list-none [&::-webkit-details-marker]:hidden">Menu</summary>
            <ul className="absolute right-0 mt-2 w-48 rounded-[28px] border border-line bg-surface p-2 shadow-[var(--shadow-card)]">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={`${linkClass} w-full`}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </nav>
    </header>
  );
}
