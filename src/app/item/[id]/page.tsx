"use client";

import { useEffect, useRef, useState } from "react";
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
  const [showTitle, setShowTitle] = useState(true);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound">("loading");

  const [titleExpanded, setTitleExpanded] = useState(false);
  const [titleOverflows, setTitleOverflows] = useState(false);
  const titleRef = useRef<HTMLParagraphElement>(null);

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
        setShowTitle(data.showTitle ?? true);
        setStatus("ok");
      });
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, [id]);

  // Detect whether the (clamped) title actually overflows 3 lines, so the
  // "Show more" toggle only appears when there's hidden text to reveal.
  useEffect(() => {
    const el = titleRef.current;
    if (!el || titleExpanded) return;
    setTitleOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [item, showTitle, titleExpanded]);

  async function save() {
    await fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        note: note || null,
        categoryId: categoryId || null,
        showTitle,
      }),
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
      <div className="space-y-2">
        <h1 className="text-xl font-semibold leading-snug tracking-tight">
          {note.trim() || item.title}
        </h1>

        {showTitle && note.trim() && (
          <div className="space-y-0.5">
            <p
              ref={titleRef}
              className={`text-sm leading-snug text-muted ${
                titleExpanded ? "" : "line-clamp-3"
              }`}
            >
              {item.title}
            </p>
            {titleOverflows && (
              <button
                type="button"
                onClick={() => setTitleExpanded((v) => !v)}
                className="text-xs font-medium text-brand transition hover:text-ink"
              >
                {titleExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}

        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-brand transition hover:text-ink break-all"
        >
          Open original →
        </a>
      </div>

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

        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={showTitle}
            onChange={(e) => setShowTitle(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-brand)]"
          />
          Show social media title
        </label>

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
