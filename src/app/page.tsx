"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { ItemGrid } from "@/components/ItemGrid";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter, type Category } from "@/components/CategoryFilter";
import type { CatalogItem } from "@/components/ItemCard";

// Returns `value` immediately on first render, then delays later updates by `ms`.
// This keeps search typing from firing a request per keystroke without adding any
// delay to the initial page load.
function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function HomePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 250);

  const { data: categories = [] } = useSWR<Category[]>("/api/categories");

  const params = new URLSearchParams();
  if (selected) params.set("category", selected);
  if (debouncedQuery) params.set("q", debouncedQuery);
  const { data: items, isLoading } = useSWR<CatalogItem[]>(
    `/api/items?${params.toString()}`
  );

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
        <ItemGrid items={items ?? []} loading={isLoading && !items} />
      </main>
    </>
  );
}
