import Link from "next/link";
import { logout } from "@/app/login/actions";
import type { Student } from "@/lib/session";

const row =
  "flex min-h-11 w-full items-center rounded-2xl px-4 text-left font-semibold hover:bg-accent";

/** Header account dropdown for a logged-in student. Native <details>: works without JavaScript. */
export function AccountMenu({ student }: { student: Student }) {
  const initial = student.name.trim().charAt(0).toUpperCase() || "?";
  const firstName = student.name.trim().split(/\s+/)[0] || student.name;

  return (
    <details className="relative">
      <summary
        aria-label={`Account menu for ${student.name}`}
        className="press flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full hover:bg-accent/60 lg:pr-3 [&::-webkit-details-marker]:hidden"
      >
        <span
          aria-hidden="true"
          className="flex size-11 items-center justify-center rounded-full bg-fg text-lg font-bold text-accent"
        >
          {initial}
        </span>
        <span className="hidden max-w-28 truncate font-semibold lg:inline">{firstName}</span>
      </summary>

      <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-[28px] border border-line bg-surface p-2 shadow-[var(--shadow-card)]">
        <div className="px-4 py-3">
          <p className="truncate font-bold">{student.name}</p>
          <p className="text-sm text-muted">{student.bsp}</p>
        </div>
        <ul className="border-t border-line pt-2">
          <li>
            <Link href="/account/orders" className={row}>
              My orders
            </Link>
          </li>
          <li>
            <Link href="/account" className={row}>
              Account settings
            </Link>
          </li>
          <li>
            <form action={logout}>
              <button className={`${row} text-link`}>Log out</button>
            </form>
          </li>
        </ul>
      </div>
    </details>
  );
}
