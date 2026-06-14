import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";
import { GET, POST } from "@/app/api/categories/route";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/categories", () => {
  it("returns categories ordered by name", async () => {
    (prisma.category.findMany as any).mockResolvedValue([
      { id: "1", name: "Anime", color: null, createdAt: new Date() },
    ]);
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Anime");
    expect(prisma.category.findMany).toHaveBeenCalledWith({ orderBy: { name: "asc" } });
  });
});

describe("POST /api/categories", () => {
  it("creates a category", async () => {
    (prisma.category.create as any).mockResolvedValue({
      id: "2", name: "Edits", color: "#ff0000", createdAt: new Date(),
    });
    const req = new Request("http://x/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: "Edits", color: "#ff0000" }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.name).toBe("Edits");
  });

  it("rejects empty name with 400", async () => {
    const req = new Request("http://x/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(prisma.category.create).not.toHaveBeenCalled();
  });
});
