import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Next.js 16: route handler `params` is a Promise and must be awaited.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, color } = await req.json();
  if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
    return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
  }
  const data: { name?: string; color?: string | null } = {};
  if (name !== undefined) data.name = name.trim();
  if (color !== undefined) data.color = color;
  const category = await prisma.category.update({ where: { id }, data });
  return NextResponse.json(category);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
