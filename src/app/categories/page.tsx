"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category } from "@/components/CategoryFilter";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");

  async function load() {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/api/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    setName("");
    setColor("#3b82f6");
    load();
  }

  async function rename(id: string, current: string) {
    const next = prompt("Rename category", current);
    if (!next || !next.trim()) return;
    await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: next }),
    });
    load();
  }

  async function changeColor(id: string, newColor: string) {
    await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ color: newColor }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this category? Its items become Uncategorized.")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <Link href="/" className="text-sm text-muted transition hover:text-ink">
          Done
        </Link>
      </div>

      <form onSubmit={add} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="input flex-1"
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-12 w-12 shrink-0 cursor-pointer rounded-xl border border-[var(--color-line)] bg-[var(--color-elevated)] p-1"
          title="Pick category color"
        />
        <button className="btn-primary shrink-0">Add</button>
      </form>

      {categories.length === 0 ? (
        <p className="card px-6 py-10 text-center text-sm text-muted">
          No categories yet. Create one above to organize your links.
        </p>
      ) : (
        <ul className="space-y-2">
          {categories.map((c) => (
            <li
              key={c.id}
              className="card flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={c.color ?? "#cccccc"}
                  onChange={(e) => changeColor(c.id, e.target.value)}
                  className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border border-[var(--color-line)] bg-transparent p-0.5"
                  title="Change color"
                />
                <span className="font-medium">{c.name}</span>
              </div>
              <span className="flex gap-4 text-sm">
                <button
                  onClick={() => rename(c.id, c.name)}
                  className="text-muted transition hover:text-ink"
                >
                  Rename
                </button>
                <button
                  onClick={() => remove(c.id)}
                  className="text-red-400 transition hover:text-red-300"
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
