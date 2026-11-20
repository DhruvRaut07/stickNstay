import { describe, expect, it } from "vitest";
import { DEFAULT_PRICES, parsePrices } from "./rules";

describe("parsePrices", () => {
  it("reads both prices from settings rows", () => {
    const rows = [
      { key: "daily_limit", value: 5 },
      { key: "price_basic", value: 40 },
      { key: "price_custom", value: 50 },
    ];
    expect(parsePrices(rows)).toEqual({ basic: 40, custom: 50 });
  });

  it("keeps the default for a missing row", () => {
    expect(parsePrices([{ key: "price_basic", value: 45 }])).toEqual({ basic: 45, custom: DEFAULT_PRICES.custom });
  });

  it.each([[0], [-5], [1.5], [10_000], ["40"], [null], [Number.NaN]])("ignores the invalid value %s", (value) => {
    expect(parsePrices([{ key: "price_basic", value }])).toEqual(DEFAULT_PRICES);
  });

  it("falls back entirely when there are no rows", () => {
    expect(parsePrices(null)).toEqual(DEFAULT_PRICES);
    expect(parsePrices(undefined)).toEqual(DEFAULT_PRICES);
    expect(parsePrices([])).toEqual(DEFAULT_PRICES);
  });
});
