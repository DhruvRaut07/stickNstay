"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";

const TABS = [
  ["/admin", "Orders"],
  ["/admin/products", "Products"],
  ["/admin/customers", "Customers"],
  ["/admin/settings", "Settings"],
] as const;

/** Tab bar shared by every admin screen, with sign out. */
export function AdminNav() {
  const path = usePathname();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Admin" className="flex flex-wrap gap-2">
        {TABS.map(([href, label]) => {
          const current = href === "/admin" ? path === "/admin" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={current ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-full border-2 px-5 font-semibold ${
                current ? "border-fg bg-accent" : "border-line bg-surface hover:bg-accent/50"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <form action={logout}>
        <button className="btn-ghost press text-sm">Sign out</button>
      </form>
    </div>
  );
}
