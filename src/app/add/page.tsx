import { prisma } from "@/lib/db";
import { AddForm } from "@/components/AddForm";
import Link from "next/link";

export default async function AddPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; text?: string }>;
}) {
  // Next.js 16: searchParams is a Promise and must be awaited.
  const sp = await searchParams;
  // Android share target may send the link in `url` or embedded in `text`.
  const shared = sp.url ?? extractUrl(sp.text) ?? "";
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Add link</h1>
        <Link href="/" className="text-sm text-muted transition hover:text-ink">
          Cancel
        </Link>
      </div>
      <AddForm initialUrl={shared} categories={categories} />
    </main>
  );
}

function extractUrl(text?: string): string | null {
  if (!text) return null;
  const match = text.match(/https?:\/\/\S+/);
  return match ? match[0] : null;
}
