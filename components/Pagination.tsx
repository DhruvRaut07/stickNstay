import Link from "next/link";
import { pageItems } from "@/lib/pagination";

type Props = {
  page: number;
  pages: number;
  /** Total rows, used for the "Showing 1-12 of 56" line. */
  total: number;
  size: number;
  basePath: string;
  /** Filters to keep in every link, e.g. { category: "aesthetic" }. Empty values are dropped. */
  params?: Record<string, string | undefined>;
  /** Element id to scroll to after changing page, so the reader lands on the list, not the page top. */
  anchor?: string;
};

const base = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 px-4 font-semibold transition";

/** Numbered page links that keep the current filters. Renders nothing for a single page. */
export function Pagination({ page, pages, total, size, basePath, params = {}, anchor }: Props) {
  if (pages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) sp.set(key, value);
    if (p > 1) sp.set("page", String(p));
    const query = sp.toString();
    return `${query ? `${basePath}?${query}` : basePath}${anchor ? `#${anchor}` : ""}`;
  };
  const from = (page - 1) * size + 1;
  const to = Math.min(page * size, total);

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center gap-3">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {page > 1 ? (
            <Link href={href(page - 1)} rel="prev" className={`${base} border-line bg-surface hover:bg-accent/50`}>
              ‹ Prev
            </Link>
          ) : (
            <span aria-disabled="true" className={`${base} border-line bg-paper text-muted`}>
              ‹ Prev
            </span>
          )}
        </li>
        {pageItems(page, pages).map((item, i) =>
          item === "gap" ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-muted">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={href(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={`${base} ${item === page ? "border-fg bg-accent" : "border-line bg-surface hover:bg-accent/50"}`}
              >
                {item}
              </Link>
            </li>
          ),
        )}
        <li>
          {page < pages ? (
            <Link href={href(page + 1)} rel="next" className={`${base} border-line bg-surface hover:bg-accent/50`}>
              Next ›
            </Link>
          ) : (
            <span aria-disabled="true" className={`${base} border-line bg-paper text-muted`}>
              Next ›
            </span>
          )}
        </li>
      </ul>
      <p className="text-sm text-muted">
        Showing {from}–{to} of {total}
      </p>
    </nav>
  );
}
