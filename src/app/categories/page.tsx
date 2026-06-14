"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category } from "@/components/CategoryFilter";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");

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
      body: JSON.stringify({ name }),
    });
    setName("");
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

  async function remove(id: string) {
    if (!confirm("Delete this category? Its items become Uncategorized.")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main className="max-w-lg mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link href="/" className="text-sm text-gray-500">
          Done
        </Link>
      </div>

      <form onSubmit={add} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 rounded-lg border px-4 py-2"
        />
        <button className="rounded-lg bg-black text-white px-4">Add</button>
      </form>

      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between border rounded-lg px-4 py-2">
            <span>{c.name}</span>
            <span className="flex gap-3 text-sm">
              <button onClick={() => rename(c.id, c.name)} className="text-blue-600">
                Rename
              </button>
              <button onClick={() => remove(c.id)} className="text-red-500">
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
