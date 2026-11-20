/** Page number from a URL param: a positive whole number, otherwise 1. */
export const parsePage = (raw: unknown): number => {
  const n = Number.parseInt(String(raw ?? ""), 10);
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 100_000) : 1;
};

export const pageCount = (total: number, size: number): number => Math.max(1, Math.ceil(total / size));

/** Inclusive row range for a database `.range(from, to)` call. */
export const pageRange = (page: number, size: number): [number, number] => [(page - 1) * size, page * size - 1];

/** One page of an in-memory list. A page past the end is clamped to the last page. */
export function paginate<T>(items: readonly T[], page: number, size: number) {
  const pages = pageCount(items.length, size);
  const current = Math.min(page, pages);
  return { items: items.slice((current - 1) * size, current * size), page: current, pages, total: items.length };
}

/** Page buttons to show: first, last and the current page with its neighbours, with gaps between. */
export function pageItems(page: number, pages: number): (number | "gap")[] {
  const wanted = [...new Set([1, page - 1, page, page + 1, pages])]
    .filter((p) => p >= 1 && p <= pages)
    .sort((a, b) => a - b);
  return wanted.flatMap((p, i) => (i > 0 && p - wanted[i - 1] > 1 ? (["gap", p] as const) : [p]));
}
