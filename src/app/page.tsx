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
    <>
      <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[rgba(8,8,12,0.7)] backdrop-blur-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-lg shadow-lg shadow-[rgba(124,92,255,0.4)]">
              🎬
            </span>
            <span className="text-lg font-semibold tracking-tight">Catalog</span>
          </Link>
          <div className="flex gap-2">
            <Link href="/categories" className="btn-ghost">
              Categories
            </Link>
            <Link href="/add" className="btn-primary">
              + Add link
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        <SearchBar value={query} onChange={setQuery} />
        <CategoryFilter categories={categories} selected={selected} onSelect={setSelected} />
        <ItemGrid items={items} />
      </main>
    </>
  );
}
