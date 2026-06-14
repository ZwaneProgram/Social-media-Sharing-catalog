import { describe, it, expect } from "vitest";
import { detectPlatform } from "@/lib/platform";

describe("detectPlatform", () => {
  it("detects youtube from youtube.com", () => {
    expect(detectPlatform("https://www.youtube.com/watch?v=abc")).toBe("youtube");
  });
  it("detects youtube from youtu.be", () => {
    expect(detectPlatform("https://youtu.be/abc")).toBe("youtube");
  });
  it("detects instagram", () => {
    expect(detectPlatform("https://www.instagram.com/reel/xyz/")).toBe("instagram");
  });
  it("detects facebook from fb.watch", () => {
    expect(detectPlatform("https://fb.watch/xyz/")).toBe("facebook");
  });
  it("detects facebook from facebook.com", () => {
    expect(detectPlatform("https://www.facebook.com/watch/?v=123")).toBe("facebook");
  });
  it("returns other for unknown", () => {
    expect(detectPlatform("https://example.com/post")).toBe("other");
  });
  it("returns other for invalid url", () => {
    expect(detectPlatform("not a url")).toBe("other");
  });
});
