import { describe, expect, it } from "vitest";
import { addItem, cartCount, checkoutSchema, parseCart, removeItem, setQty } from "./cart";
import { DAILY_LIMIT } from "./rules";

const person = { name: "Test Student", mobile: "9876543210" };

describe("addItem", () => {
  it("adds a new product with quantity 1", () => {
    expect(addItem([], "golden-hour")).toEqual([{ slug: "golden-hour", qty: 1 }]);
  });

  it("increments an existing product without mutating the input", () => {
    const before = [{ slug: "golden-hour", qty: 1 }];
    const after = addItem(before, "golden-hour");
    expect(after).toEqual([{ slug: "golden-hour", qty: 2 }]);
    expect(before).toEqual([{ slug: "golden-hour", qty: 1 }]);
  });

  it("refuses to go past the daily limit across all products", () => {
    const full = [
      { slug: "a", qty: 3 },
      { slug: "b", qty: DAILY_LIMIT - 3 },
    ];
    expect(addItem(full, "c")).toBe(full);
    expect(addItem(full, "a")).toBe(full);
  });
});

describe("setQty", () => {
  it("sets a quantity", () => {
    expect(setQty([{ slug: "a", qty: 1 }], "a", 3)).toEqual([{ slug: "a", qty: 3 }]);
  });

  it("removes the item when quantity is zero or less", () => {
    expect(setQty([{ slug: "a", qty: 2 }], "a", 0)).toEqual([]);
  });

  it("clamps so the whole cart stays within the limit", () => {
    const items = [
      { slug: "a", qty: 2 },
      { slug: "b", qty: 1 },
    ];
    const next = setQty(items, "a", 99);
    expect(cartCount(next)).toBe(DAILY_LIMIT);
    expect(next.find((i) => i.slug === "a")?.qty).toBe(DAILY_LIMIT - 1);
  });
});

describe("removeItem / cartCount", () => {
  it("removes only the named product", () => {
    const items = [
      { slug: "a", qty: 1 },
      { slug: "b", qty: 2 },
    ];
    expect(removeItem(items, "a")).toEqual([{ slug: "b", qty: 2 }]);
    expect(cartCount(items)).toBe(3);
  });
});

describe("parseCart", () => {
  it("returns an empty cart for missing or corrupt storage", () => {
    expect(parseCart(null)).toEqual([]);
    expect(parseCart("not json")).toEqual([]);
    expect(parseCart('{"slug":"a"}')).toEqual([]);
  });

  it("rejects tampered quantities and slugs", () => {
    expect(parseCart('[{"slug":"a","qty":999}]')).toEqual([]);
    expect(parseCart('[{"slug":"../etc","qty":1}]')).toEqual([]);
    expect(parseCart('[{"slug":"a","qty":3},{"slug":"b","qty":3}]')).toEqual([]);
  });

  it("round-trips a valid cart", () => {
    const items = [{ slug: "golden-hour", qty: 2 }];
    expect(parseCart(JSON.stringify(items))).toEqual(items);
  });
});

describe("checkoutSchema", () => {
  const items = [{ slug: "golden-hour", qty: 2 }];

  it("accepts a valid checkout", () => {
    const parsed = checkoutSchema.safeParse({ ...person, bsp: "26BSP0001", items });
    expect(parsed.success).toBe(true);
  });

  it("rejects an empty cart", () => {
    const parsed = checkoutSchema.safeParse({ ...person, bsp: "26BSP0001", items: [] });
    expect(parsed.success).toBe(false);
  });

  it("rejects more magnets than the daily limit", () => {
    const parsed = checkoutSchema.safeParse({
      ...person,
      bsp: "26BSP0001",
      items: [
        { slug: "a", qty: 3 },
        { slug: "b", qty: 3 },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects duplicate products so one line cannot hide extra quantity", () => {
    const parsed = checkoutSchema.safeParse({
      ...person,
      bsp: "26BSP0001",
      items: [
        { slug: "a", qty: 1 },
        { slug: "a", qty: 1 },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects a bad mobile number", () => {
    const parsed = checkoutSchema.safeParse({ ...person, mobile: "123", bsp: "26BSP0001", items });
    expect(parsed.success).toBe(false);
  });
});
