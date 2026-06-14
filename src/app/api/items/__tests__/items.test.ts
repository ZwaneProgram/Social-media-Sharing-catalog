import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    item: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));
vi.mock("@/lib/metadata", () => ({
  fetchMetadata: vi.fn(),
}));

import { prisma } from "@/lib/db";
import { fetchMetadata } from "@/lib/metadata";
import { GET, POST } from "@/app/api/items/route";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/items", () => {
  it("fetches metadata then stores the item", async () => {
    (prisma.item.findFirst as any).mockResolvedValue(null);
    (fetchMetadata as any).mockResolvedValue({
      title: "Cool Video",
      thumbnailUrl: "https://img/yt.jpg",
      platform: "youtube",
    });
    (prisma.item.create as any).mockResolvedValue({ id: "1" });
    const req = new Request("http://x/api/items", {
      method: "POST",
      body: JSON.stringify({
        url: "https://youtu.be/abc",
        note: "for my edit",
        categoryId: "cat1",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(fetchMetadata).toHaveBeenCalledWith("https://youtu.be/abc");
    expect(prisma.item.create).toHaveBeenCalledWith({
      data: {
        url: "https://youtu.be/abc",
        title: "Cool Video",
        thumbnailUrl: "https://img/yt.jpg",
        platform: "youtube",
        note: "for my edit",
        categoryId: "cat1",
      },
    });
  });

  it("returns 409 when the url already exists and force is not set", async () => {
    (prisma.item.findFirst as any).mockResolvedValue({ id: "existing1" });
    const req = new Request("http://x/api/items", {
      method: "POST",
      body: JSON.stringify({ url: "https://youtu.be/abc" }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(409);
    expect(body.existingId).toBe("existing1");
    expect(prisma.item.create).not.toHaveBeenCalled();
  });

  it("saves a duplicate anyway when force is true", async () => {
    (prisma.item.findFirst as any).mockResolvedValue({ id: "existing1" });
    (fetchMetadata as any).mockResolvedValue({
      title: "Cool Video",
      thumbnailUrl: null,
      platform: "youtube",
    });
    (prisma.item.create as any).mockResolvedValue({ id: "2" });
    const req = new Request("http://x/api/items", {
      method: "POST",
      body: JSON.stringify({ url: "https://youtu.be/abc", force: true }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(prisma.item.create).toHaveBeenCalled();
  });

  it("rejects missing url with 400", async () => {
    const req = new Request("http://x/api/items", {
      method: "POST",
      body: JSON.stringify({ note: "x" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/items", () => {
  it("filters by category and search query", async () => {
    (prisma.item.findMany as any).mockResolvedValue([]);
    const req = new Request("http://x/api/items?category=cat1&q=anime");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(prisma.item.findMany).toHaveBeenCalledWith({
      where: {
        categoryId: "cat1",
        OR: [
          { title: { contains: "anime", mode: "insensitive" } },
          { note: { contains: "anime", mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });
  });

  it("returns all items when no filters", async () => {
    (prisma.item.findMany as any).mockResolvedValue([]);
    const req = new Request("http://x/api/items");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(prisma.item.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });
  });
});
