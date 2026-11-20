import { describe, expect, it } from "vitest";
import { pageCount, pageItems, pageRange, paginate, parsePage } from "./pagination";

describe("parsePage", () => {
  it.each([
    ["3", 3],
    ["1", 1],
    [undefined, 1],
    ["0", 1],
    ["-4", 1],
    ["abc", 1],
    ["2.9", 2],
    ["999999999", 100_000],
  ])("%s -> %s", (raw, expected) => {
    expect(parsePage(raw)).toBe(expected);
  });
});

describe("pageCount and pageRange", () => {
  it("rounds up and never goes below one page", () => {
    expect(pageCount(0, 12)).toBe(1);
    expect(pageCount(12, 12)).toBe(1);
    expect(pageCount(13, 12)).toBe(2);
    expect(pageCount(56, 12)).toBe(5);
  });

  it("gives inclusive database ranges", () => {
    expect(pageRange(1, 20)).toEqual([0, 19]);
    expect(pageRange(3, 20)).toEqual([40, 59]);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);

  it("slices the requested page", () => {
    const p = paginate(items, 2, 10);
    expect(p.items).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(p).toMatchObject({ page: 2, pages: 3, total: 25 });
  });

  it("clamps a page past the end to the last page", () => {
    const p = paginate(items, 99, 10);
    expect(p.page).toBe(3);
    expect(p.items).toEqual([21, 22, 23, 24, 25]);
  });

  it("handles an empty list", () => {
    expect(paginate([], 1, 10)).toMatchObject({ items: [], page: 1, pages: 1, total: 0 });
  });
});

describe("pageItems", () => {
  it("shows every page when there are few", () => {
    expect(pageItems(2, 3)).toEqual([1, 2, 3]);
  });

  it("adds gaps around a distant current page", () => {
    expect(pageItems(10, 20)).toEqual([1, "gap", 9, 10, 11, "gap", 20]);
  });

  it("has no gap next to the edges", () => {
    expect(pageItems(1, 20)).toEqual([1, 2, "gap", 20]);
    expect(pageItems(20, 20)).toEqual([1, "gap", 19, 20]);
  });
});
