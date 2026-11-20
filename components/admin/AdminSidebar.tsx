"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { logout } from "@/app/admin/actions";
import { Logo } from "@/components/Logo";

const icon = (d: string): ReactNode => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true, icon: icon("M4 13h6V4H4v9zm10 7h6V4h-6v16zM4 20h6v-4H4v4z") },
  { href: "/admin/orders", label: "Orders", icon: icon("M6 8h12l1 12H5L6 8zM9 8a3 3 0 0 1 6 0") },
  { href: "/admin/products", label: "Products", icon: icon("M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM4 7.5l8 4.5 8-4.5M12 12v9") },
  { href: "/admin/customers", label: "Customers", icon: icon("M16 20v-1.5a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM20 20v-1.5a4 4 0 0 0-3-3.9M15 4.3a3.5 3.5 0 0 1 0 6.4") },
  { href: "/admin/students", label: "Students", icon: icon("M2 9l10-5 10 5-10 5L2 9zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6") },
  { href: "/admin/settings", label: "Settings", icon: icon("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z") },
] as const;

function NavLinks() {
  const path = usePathname();
  return (
    <ul className="space-y-1">
      {NAV.map((item) => {
        const current = "exact" in item && item.exact ? path === item.href : path.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition ${
                current ? "bg-accent text-fg" : "text-bg/80 hover:bg-white/10 hover:text-bg"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Account({ email }: { email: string }) {
  return (
    <div className="border-t border-white/10 pt-4">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-base font-bold text-fg">
          {email.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-bg" title={email}>
            {email}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-bg/70">
            <span aria-hidden="true" className="size-2 rounded-full bg-[#4ADE80]" />
            Signed in
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-white/20 text-sm font-semibold text-bg hover:bg-white/10"
        >
          View store
        </Link>
        <form action={logout} className="flex-1">
          <button className="min-h-10 w-full rounded-xl bg-white/10 text-sm font-semibold text-bg hover:bg-white/20">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

/** Dark sidebar on desktop; a top bar with a menu on phones. Both carry the logo and the signed-in admin. */
export function AdminSidebar({ email }: { email: string }) {
  return (
    <>
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 bg-fg px-4 py-6 md:flex">
        <Link href="/admin" aria-label="stickNstay admin home" className="px-2">
          <Logo on="dark" className="h-9" />
        </Link>
        <p className="-mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-bg/50">Admin</p>
        <nav aria-label="Admin" className="flex-1 overflow-y-auto">
          <NavLinks />
        </nav>
        <Account email={email} />
      </aside>

      <header className="sticky top-0 z-40 bg-fg md:hidden">
        <details>
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between px-4 [&::-webkit-details-marker]:hidden">
            <Logo on="dark" className="h-8" />
            <span className="inline-flex size-11 items-center justify-center rounded-xl text-bg" aria-label="Menu">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </span>
          </summary>
          <div className="space-y-5 px-4 pb-5">
            <nav aria-label="Admin">
              <NavLinks />
            </nav>
            <Account email={email} />
          </div>
        </details>
      </header>
    </>
  );
}
