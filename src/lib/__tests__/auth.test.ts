import { describe, it, expect, beforeEach } from "vitest";
import { checkPassword, makeSessionToken, isValidToken } from "@/lib/auth";

beforeEach(() => {
  process.env.APP_PASSWORD = "secret123";
});

describe("checkPassword", () => {
  it("accepts the correct password", () => {
    expect(checkPassword("secret123")).toBe(true);
  });
  it("rejects the wrong password", () => {
    expect(checkPassword("nope")).toBe(false);
  });
});

describe("session token", () => {
  it("a freshly made token is valid", () => {
    const token = makeSessionToken();
    expect(isValidToken(token)).toBe(true);
  });
  it("a garbage token is invalid", () => {
    expect(isValidToken("garbage")).toBe(false);
  });
});
