"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/components/CategoryFilter";

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function save(force: boolean) {
    return fetch("/api/items", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        url,
        note: note || null,
        categoryId: categoryId || null,
        force,
      }),
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    let res = await save(false);

    // 409 = this link is already saved. Ask whether to save it again.
    if (res.status === 409) {
      if (confirm("You already saved this link. Save it again anyway?")) {
        res = await save(true);
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
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Link</label>
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a link…"
          className="w-full rounded-lg border px-4 py-3"
          autoFocus={!initialUrl}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's the idea? Why save it?"
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
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        disabled={saving}
        className="w-full rounded-lg bg-black text-white py-3 font-medium disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
