import Link from "next/link";

const TABS = [
  { key: "account", href: "/account", label: "Account" },
  { key: "orders", href: "/account/orders", label: "My orders" },
] as const;

/** Pill tabs shared by the account pages. */
export function AccountNav({ active }: { active: (typeof TABS)[number]["key"] }) {
  return (
    <nav aria-label="Account" className="flex flex-wrap gap-3">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? "page" : undefined}
          className={`inline-flex min-h-11 items-center rounded-full border-2 px-5 font-semibold transition ${
            tab.key === active ? "border-fg bg-accent" : "border-line bg-surface"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
