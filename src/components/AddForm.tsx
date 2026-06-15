"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/components/CategoryFilter";

// Sentinel value for the "create a new category" option in the dropdown.
const NEW_CATEGORY = "__new__";

export function AddForm({
  initialUrl,
  categories,
}: {
  initialUrl: string;
  categories: Category[];
}) {
  const [url, setUrl] = useState(initialUrl);
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#7c5cff");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const creatingNew = categoryId === NEW_CATEGORY;

  async function saveItem(force: boolean, finalCategoryId: string | null) {
    return fetch("/api/items", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        url,
        note: note || null,
        categoryId: finalCategoryId,
        force,
      }),
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    // If the user chose "new category", create it first and use its id.
    let finalCategoryId: string | null = categoryId || null;
    if (creatingNew) {
      if (!newCatName.trim()) {
        setError("Type a name for the new category.");
        setSaving(false);
        return;
      }
      const catRes = await fetch("/api/categories", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim(), color: newCatColor }),
      });
      if (!catRes.ok) {
        setError("Could not create the category. Try again.");
        setSaving(false);
        return;
      }
      const created = await catRes.json();
      finalCategoryId = created.id;
    }

    let res = await saveItem(false, finalCategoryId);

    // 409 = this link is already saved. Ask whether to save it again.
    if (res.status === 409) {
      if (confirm("You already saved this link. Save it again anyway?")) {
        res = await saveItem(true, finalCategoryId);
      } else {
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Could not save. Check the link and try again.");
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-2xl border border-[var(--color-line-strong)] bg-[#23232f] p-5 shadow-2xl shadow-black/40"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">Link</label>
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a link…"
          className="input bg-[var(--color-canvas)]"
          autoFocus={!initialUrl}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's the idea? Why save it?"
          className="input resize-none bg-[var(--color-canvas)]"
          rows={3}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="input bg-[var(--color-canvas)]"
        >
          <option value="">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value={NEW_CATEGORY}>+ Create new category…</option>
        </select>

        {creatingNew && (
          <div className="mt-2 flex gap-2">
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New category name"
              className="input flex-1 bg-[var(--color-canvas)]"
              autoFocus
            />
            <input
              type="color"
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              className="h-12 w-12 shrink-0 cursor-pointer rounded-xl border border-[var(--color-line)] bg-[var(--color-canvas)] p-1"
              title="Pick category color"
            />
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button disabled={saving} className="btn-primary w-full py-3 text-base">
        {saving ? "Saving…" : "Save to catalog"}
      </button>
    </form>
  );
}
