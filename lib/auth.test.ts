import { beforeAll, describe, expect, it } from "vitest";
import {
  SESSION_TTL_MS,
  codeMatches,
  emailMatchesStudent,
  generateCode,
  hashCode,
  readSession,
  safeNext,
  signSession,
} from "./auth";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-test-secret-test-secret-1234";
});

describe("emailMatchesStudent", () => {
  it("accepts a college email containing a word from the roster name", () => {
    expect(emailMatchesStudent("dhruv.raut26@ibsindia.org", "Dhruv Raut")).toBe(true);
    expect(emailMatchesStudent("  R.Sharma26@IBSINDIA.ORG ", "Riya Sharma")).toBe(true);
  });
  it("rejects other domains, lookalikes and unrelated names", () => {
    expect(emailMatchesStudent("dhruv.raut26@gmail.com", "Dhruv Raut")).toBe(false);
    expect(emailMatchesStudent("dhruv@ibsindia.org.evil.com", "Dhruv Raut")).toBe(false);
    expect(emailMatchesStudent("a@b@ibsindia.org", "Dhruv Raut")).toBe(false);
    expect(emailMatchesStudent("someone.else26@ibsindia.org", "Dhruv Raut")).toBe(false);
  });
  it("ignores initials shorter than 3 letters", () => {
    expect(emailMatchesStudent("dr26@ibsindia.org", "Dhruv Raut")).toBe(false);
  });
});

describe("login codes", () => {
  it("generates 6 digits", () => {
    for (let i = 0; i < 50; i++) expect(generateCode()).toMatch(/^\d{6}$/);
  });
  it("matches only the right code for the right BSP", () => {
    const h = hashCode("26BSP0001", "123456");
    expect(codeMatches("26BSP0001", "123456", h)).toBe(true);
    expect(codeMatches("26BSP0001", "654321", h)).toBe(false);
    expect(codeMatches("26BSP0002", "123456", h)).toBe(false);
  });
});

describe("sessions", () => {
  it("round-trips a valid token", () => {
    expect(readSession(signSession("26BSP0001"))).toBe("26BSP0001");
  });
  it("rejects tampered, expired, malformed and missing tokens", () => {
    const token = signSession("26BSP0001");
    expect(readSession(token.replace("26BSP0001", "26BSP0002"))).toBeNull();
    expect(readSession(token.slice(0, -2) + "xx")).toBeNull();
    expect(readSession(signSession("26BSP0001", 0), SESSION_TTL_MS + 1)).toBeNull();
    expect(readSession("garbage")).toBeNull();
    expect(readSession(undefined)).toBeNull();
  });
  it("rejects tokens signed with another secret", () => {
    const token = signSession("26BSP0001");
    process.env.SESSION_SECRET = "different-secret-different-secret-12345";
    expect(readSession(token)).toBeNull();
    process.env.SESSION_SECRET = "test-secret-test-secret-test-secret-1234";
  });
});

describe("safeNext", () => {
  it("keeps same-site paths and blocks external redirects", () => {
    expect(safeNext("/order?variant=basic")).toBe("/order?variant=basic");
    expect(safeNext("//evil.com")).toBe("/shop");
    expect(safeNext("https://evil.com")).toBe("/shop");
    expect(safeNext(undefined)).toBe("/shop");
  });
});
