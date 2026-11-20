import Link from "next/link";
import { getStudent } from "@/lib/session";
import { NAV_LINKS } from "@/lib/site";
import { AccountMenu } from "./AccountMenu";
import { CartLink } from "./CartLink";
import { Logo } from "./Logo";

const linkClass =
  "inline-flex min-h-11 items-center rounded-full px-4 font-semibold hover:bg-accent";

export async function SiteHeader() {
  const student = await getStudent();

  return (
    <header className="glass sticky top-0 z-50">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-5"
      >
        <Link href="/" aria-label="stickNstay home" className="shrink-0 py-2">
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

        <div className="flex items-center gap-1 sm:gap-2">
          <CartLink />
          {student ? (
            <AccountMenu student={student} />
          ) : (
            <Link
              href="/login"
              className="press hidden min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-accent px-5 font-semibold hover:bg-accent-deep sm:inline-flex"
            >
              Log in
            </Link>
          )}
          {/* Native disclosure: works without JavaScript. */}
          <details className="relative md:hidden">
            <summary
              aria-label="Menu"
              className="press flex size-11 cursor-pointer list-none items-center justify-center rounded-full hover:bg-accent/60 [&::-webkit-details-marker]:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </summary>
            <ul className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-[28px] border border-line bg-surface p-2 shadow-[var(--shadow-card)]">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={`${linkClass} w-full`}>
                    {l.label}
                  </Link>
                </li>
              ))}
              {!student && (
                <li className="sm:hidden">
                  <Link href="/login" className={`${linkClass} w-full`}>
                    Log in
                  </Link>
                </li>
              )}
            </ul>
          </details>
        </div>
      </nav>
    </header>
  );
}
