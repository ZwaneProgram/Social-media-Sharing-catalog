import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { name, color } = await req.json();
  if (typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const category = await prisma.category.create({
    data: { name: name.trim(), color: color ?? null },
  });
  return NextResponse.json(category, { status: 201 });
}
