import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchMetadata } from "@/lib/metadata";
import { cacheThumbnail } from "@/lib/thumbnail";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  const where: Record<string, unknown> = {};
  if (category) where.categoryId = category;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { note: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.item.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const { url, note, categoryId, force } = await req.json();
  if (typeof url !== "string" || url.trim() === "") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }
  const cleanUrl = url.trim();

  // Duplicate guard: warn unless the caller explicitly forces the save.
  if (!force) {
    const existing = await prisma.item.findFirst({ where: { url: cleanUrl } });
    if (existing) {
      return NextResponse.json(
        { error: "duplicate", existingId: existing.id },
        { status: 409 }
      );
    }
  }

  const meta = await fetchMetadata(cleanUrl);
  // Re-host expiring IG/FB thumbnails to a permanent copy (best-effort).
  const thumbnailUrl = await cacheThumbnail(meta.thumbnailUrl, meta.platform);
  const item = await prisma.item.create({
    data: {
      url: cleanUrl,
      title: meta.title,
      thumbnailUrl,
      platform: meta.platform,
      note: note ?? null,
      categoryId: categoryId ?? null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
