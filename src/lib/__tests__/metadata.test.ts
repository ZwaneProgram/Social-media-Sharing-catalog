import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchMetadata } from "@/lib/metadata";

beforeEach(() => {
  vi.restoreAllMocks();
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchMetadata", () => {
  it("uses youtube oembed for youtube urls", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ title: "Cool Video", thumbnail_url: "https://img/yt.jpg" }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );
    const meta = await fetchMetadata("https://youtu.be/abc");
    expect(meta).toEqual({
      title: "Cool Video",
      thumbnailUrl: "https://img/yt.jpg",
      platform: "youtube",
    });
  });

  it("parses opengraph tags for other urls", async () => {
    const html = `<html><head>
      <meta property="og:title" content="An IG Reel" />
      <meta property="og:image" content="https://img/ig.jpg" />
    </head></html>`;
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(html, { status: 200, headers: { "content-type": "text/html" } })
    );
    const meta = await fetchMetadata("https://example.com/post");
    expect(meta).toEqual({
      title: "An IG Reel",
      thumbnailUrl: "https://img/ig.jpg",
      platform: "other",
    });
  });

  it("falls back to url as title when fetch fails", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network"));
    const meta = await fetchMetadata("https://example.com/broken");
    expect(meta).toEqual({
      title: "https://example.com/broken",
      thumbnailUrl: null,
      platform: "other",
    });
  });

  it("falls back when og tags are missing", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("<html><head></head></html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      })
    );
    const meta = await fetchMetadata("https://example.com/empty");
    expect(meta.title).toBe("https://example.com/empty");
    expect(meta.thumbnailUrl).toBeNull();
  });
});
