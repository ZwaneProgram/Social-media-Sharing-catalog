"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ItemGrid } from "@/components/ItemGrid";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter, type Category } from "@/components/CategoryFilter";
import type { CatalogItem } from "@/components/ItemCard";

export default function HomePage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const loadItems = useCallback(async () => {
    const params = new URLSearchParams();
    if (selected) params.set("category", selected);
    if (query) params.set("q", query);
    const res = await fetch(`/api/items?${params.toString()}`);
    setItems(await res.json());
  }, [selected, query]);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    const t = setTimeout(loadItems, 200); // debounce search
    return () => clearTimeout(t);
  }, [loadItems]);

  return (
    <main className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catalog</h1>
        <div className="flex gap-2">
          <Link href="/categories" className="px-3 py-2 rounded-lg border text-sm">
            Categories
          </Link>
          <Link href="/add" className="px-3 py-2 rounded-lg bg-black text-white text-sm">
            + Add
          </Link>
        </div>
      </div>
      <SearchBar value={query} onChange={setQuery} />
      <CategoryFilter categories={categories} selected={selected} onSelect={setSelected} />
      <ItemGrid items={items} />
    </main>
  );
}
