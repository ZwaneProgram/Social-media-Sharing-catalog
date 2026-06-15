"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import type { CatalogItem } from "@/components/ItemCard";
import type { Category } from "@/components/CategoryFilter";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound">("loading");

  useEffect(() => {
    fetch(`/api/items/${id}`)
      .then((r) => {
        if (!r.ok) {
          setStatus("notfound");
          return null;
        }
        return r.json();
      })
      .then((data: CatalogItem | null) => {
        if (!data) return;
        setItem(data);
        setNote(data.note ?? "");
        setCategoryId(data.categoryId ?? "");
        setStatus("ok");
      });
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, [id]);

  async function save() {
    await fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ note: note || null, categoryId: categoryId || null }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function remove() {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  if (status === "notfound")
    return (
      <main className="mx-auto max-w-lg space-y-3 px-4 py-10 text-center">
        <p className="text-4xl">🔍</p>
        <p className="text-muted">Item not found.</p>
        <Link href="/" className="text-sm text-brand transition hover:text-ink">
          ← Back to catalog
        </Link>
      </main>
    );

  if (status === "loading" || !item)
    return <main className="px-4 py-10 text-center text-muted">Loading…</main>;

  return (
    <main className="max-w-lg mx-auto px-4 py-5 space-y-4">
      <button
        onClick={() => router.back()}
        className="text-sm text-muted transition hover:text-ink"
      >
        ← Back
      </button>
      {item.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className="w-full rounded-2xl border border-[var(--color-line)]"
        />
      )}
      <h1 className="text-xl font-semibold leading-snug tracking-tight">{item.title}</h1>
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-sm text-brand transition hover:text-ink break-all"
      >
        Open original →
      </a>

      <div className="card space-y-5 p-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input resize-none"
            rows={3}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input"
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button onClick={save} className="btn-primary flex-1 py-3">
            {saved ? "Saved ✓" : "Save changes"}
          </button>
          <button
            onClick={remove}
            className="btn border border-red-500/60 px-4 text-red-400 transition hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      </div>
    </main>
  );
}
