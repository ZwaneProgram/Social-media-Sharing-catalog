import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { put } from "@vercel/blob";
import { cacheThumbnail } from "@/lib/thumbnail";

vi.mock("@vercel/blob", () => ({ put: vi.fn() }));

const imageResponse = () =>
  new Response(new Uint8Array([1, 2, 3]), {
    status: 200,
    headers: { "content-type": "image/jpeg" },
  });

beforeEach(() => {
  vi.restoreAllMocks();
  vi.mocked(put).mockReset();
  process.env.BLOB_READ_WRITE_TOKEN = "test-token";
});
afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.BLOB_READ_WRITE_TOKEN;
});

describe("cacheThumbnail", () => {
  it("re-hosts instagram thumbnails to a blob url", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(imageResponse());
    vi.mocked(put).mockResolvedValue({ url: "https://blob.store/thumb.jpg" } as Awaited<
      ReturnType<typeof put>
    >);

    const result = await cacheThumbnail("https://cdn/ig.jpg?oh=x&oe=y", "instagram");

    expect(put).toHaveBeenCalledOnce();
    expect(result).toBe("https://blob.store/thumb.jpg");
  });

  it("leaves youtube thumbnails untouched (already permanent)", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    const result = await cacheThumbnail("https://i.ytimg.com/vi/x/hq.jpg", "youtube");
    expect(result).toBe("https://i.ytimg.com/vi/x/hq.jpg");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(put).not.toHaveBeenCalled();
  });

  it("falls back to the original url when no blob token is set", async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const result = await cacheThumbnail("https://cdn/ig.jpg", "instagram");
    expect(result).toBe("https://cdn/ig.jpg");
    expect(put).not.toHaveBeenCalled();
  });

  it("falls back to the original url when the image fetch fails", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network"));
    const result = await cacheThumbnail("https://cdn/ig.jpg", "facebook");
    expect(result).toBe("https://cdn/ig.jpg");
  });

  it("returns null when there is no thumbnail", async () => {
    const result = await cacheThumbnail(null, "instagram");
    expect(result).toBeNull();
  });
});
