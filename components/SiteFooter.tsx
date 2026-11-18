import Link from "next/link";
import { NAV_LINKS } from "@/lib/site";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-fg py-12 text-bg">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-5 text-center">
        <Logo on="dark" className="h-8" />
        <p className="max-w-md">Magnet stickers that make your corner look like you.</p>
        <ul className="flex flex-wrap justify-center gap-x-2 gap-y-1">
          {[{ href: "/order", label: "Order" }, ...NAV_LINKS].map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="inline-flex min-h-11 items-center rounded-full px-4 font-semibold hover:text-accent focus-visible:outline-bg"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-sm">StickNstay · A marketing project at IBS Mumbai</p>
      </div>
    </footer>
  );
}
