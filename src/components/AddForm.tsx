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
    <form onSubmit={submit} className="card space-y-5 p-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">Link</label>
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a link…"
          className="input"
          autoFocus={!initialUrl}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's the idea? Why save it?"
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
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button disabled={saving} className="btn-primary w-full py-3 text-base">
        {saving ? "Saving…" : "Save to catalog"}
      </button>
    </form>
  );
}
