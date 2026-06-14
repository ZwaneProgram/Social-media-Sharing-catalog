"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

  useEffect(() => {
    fetch(`/api/items/${id}`)
      .then((r) => r.json())
      .then((data: CatalogItem) => {
        setItem(data);
        setNote(data.note ?? "");
        setCategoryId(data.categoryId ?? "");
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

  if (!item) return <main className="p-4">Loading…</main>;

  return (
    <main className="max-w-lg mx-auto p-4 space-y-4">
      <button onClick={() => router.back()} className="text-sm text-gray-500">
        ← Back
      </button>
      {item.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.thumbnailUrl} alt={item.title} className="w-full rounded-xl" />
      )}
      <h1 className="text-xl font-bold">{item.title}</h1>
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 text-sm break-all"
      >
        Open original →
      </a>

      <div>
        <label className="block text-sm font-medium mb-1">Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-lg border px-4 py-3"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-lg border px-4 py-3"
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
        <button onClick={save} className="flex-1 rounded-lg bg-black text-white py-3">
          {saved ? "Saved ✓" : "Save changes"}
        </button>
        <button onClick={remove} className="rounded-lg border border-red-500 text-red-500 px-4">
          Delete
        </button>
      </div>
    </main>
  );
}
