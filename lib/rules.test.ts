import { describe, expect, it } from "vitest";
import {
  detectImageType,
  normalizeBsp,
  normalizeMobile,
  orderSchema,
} from "./rules";

const valid = {
  name: "Asha Rao",
  mobile: "98765 43210",
  bsp: " bsp21001 ",
  email: "",
  variant: "custom",
  qty: "2",
  note: "",
};

describe("normalizers", () => {
  it("strips +91 / 91 / 0 prefixes and spaces from mobiles", () => {
    expect(normalizeMobile("+91 98765-43210")).toBe("9876543210");
    expect(normalizeMobile("919876543210")).toBe("9876543210");
    expect(normalizeMobile("09876543210")).toBe("9876543210");
  });

  it("uppercases and trims BSP numbers", () => {
    expect(normalizeBsp("  bsp 21001 ")).toBe("BSP21001");
  });
});

describe("orderSchema", () => {
  it("accepts a valid order and normalizes fields", () => {
    const r = orderSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.mobile).toBe("9876543210");
      expect(r.data.bsp).toBe("BSP21001");
      expect(r.data.qty).toBe(2);
      expect(r.data.email).toBeUndefined();
    }
  });

  it.each([
    ["short mobile", { mobile: "12345" }],
    ["mobile starting with 5", { mobile: "5876543210" }],
    ["qty above daily limit", { qty: "6" }],
    ["qty zero", { qty: "0" }],
    ["unknown variant", { variant: "deluxe" }],
    ["bad email", { email: "nope" }],
    ["one-char name", { name: "A" }],
  ])("rejects %s", (_label, patch) => {
    expect(orderSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });
});

describe("detectImageType", () => {
  it("recognises jpg, png and webp by magic bytes", () => {
    expect(detectImageType(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]))).toBe("jpg");
    expect(
      detectImageType(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    ).toBe("png");
    const webp = new TextEncoder().encode("RIFF\0\0\0\0WEBP");
    expect(detectImageType(webp)).toBe("webp");
  });

  it("rejects other content even if renamed .jpg", () => {
    expect(detectImageType(new TextEncoder().encode("<?php echo 1;"))).toBeNull();
  });
});
