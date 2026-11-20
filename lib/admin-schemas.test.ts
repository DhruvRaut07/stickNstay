import { describe, expect, it } from "vitest";
import { adminRedirect, firstIssue, orIlike, productSchema, searchTerm } from "./admin-schemas";

describe("search helpers", () => {
  it("keeps dots and @ so emails and order codes match", () => {
    expect(searchTerm("john.doe@ibsindia.org")).toBe("john.doe@ibsindia.org");
    expect(orIlike(["name", "email"], "a.b")).toBe('name.ilike."%a.b%",email.ilike."%a.b%"');
  });

  it("strips wildcards, quotes and backslashes that could break the filter", () => {
    expect(searchTerm('a%b*c"d\\e')).toBe("abcde");
  });

  it("trims and caps length", () => {
    expect(searchTerm("  x  ")).toBe("x");
    expect(searchTerm("y".repeat(100))).toHaveLength(40);
  });

  it("allows * in a redirect that carries a search term", () => {
    expect(adminRedirect("/admin/products?q=a*b", "Saved")).toBe("/admin/products?q=a*b&msg=Saved");
  });
});

const valid = {
  slug: "snacks-first",
  name: "Snacks First",
  description: "Priorities, sorted. Stick it on the fridge.",
  category_slug: "doodles-fun",
  image_url: "/stickers/06-gen-z-and-funny/snacks-first.webp",
  sort: "7",
  active: "on",
};

describe("productSchema", () => {
  it("accepts a valid product and coerces sort and active", () => {
    const parsed = productSchema.parse(valid);
    expect(parsed.sort).toBe(7);
    expect(parsed.active).toBe(true);
  });

  it("treats a missing checkbox as inactive and a blank image as none", () => {
    const parsed = productSchema.parse({ ...valid, active: undefined, image_url: "  " });
    expect(parsed.active).toBe(false);
    expect(parsed.image_url).toBeUndefined();
  });

  it.each([
    ["bad slug", { slug: "Snacks First" }],
    ["short name", { name: "x" }],
    ["short description", { description: "too short" }],
    ["remote image", { image_url: "https://evil.example/a.webp" }],
    ["path traversal image", { image_url: "/stickers/../secret.webp" }],
    ["negative sort", { sort: "-1" }],
  ])("rejects %s with a readable message", (_label, patch) => {
    const result = productSchema.safeParse({ ...valid, ...patch });
    expect(result.success).toBe(false);
    if (!result.success) expect(firstIssue(result.error).length).toBeGreaterThan(3);
  });
});

describe("adminRedirect", () => {
  it("keeps filters and appends the message", () => {
    expect(adminRedirect("/admin?status=new&q=abc", "Saved.")).toBe("/admin?status=new&q=abc&msg=Saved.");
  });

  it("adds the first query param when there is none", () => {
    expect(adminRedirect("/admin/products", "Done")).toBe("/admin/products?msg=Done");
  });

  it("encodes the message", () => {
    expect(adminRedirect("/admin", "a b&c")).toBe("/admin?msg=a%20b%26c");
  });

  it.each(["https://evil.example", "//evil.example", "/shop", "/admin/../etc", undefined, 42])(
    "falls back for unsafe target %s",
    (target) => {
      expect(adminRedirect(target, "x")).toBe("/admin?msg=x");
    },
  );
});
