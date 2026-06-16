import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Next.js 16: route handler `params` is a Promise and must be awaited.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await prisma.item.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { note, categoryId, showTitle } = await req.json();
  const data: {
    note?: string | null;
    categoryId?: string | null;
    showTitle?: boolean;
  } = {};
  if (note !== undefined) data.note = note;
  if (categoryId !== undefined) data.categoryId = categoryId;
  if (showTitle !== undefined) data.showTitle = Boolean(showTitle);
  const item = await prisma.item.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.item.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
