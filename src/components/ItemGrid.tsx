import { ItemCard, type CatalogItem } from "@/components/ItemCard";

export function ItemGrid({
  items,
  loading = false,
}: {
  items: CatalogItem[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="aspect-video animate-pulse bg-[var(--color-elevated)]" />
            <div className="space-y-2 p-3">
              <div className="h-3 w-1/3 animate-pulse rounded bg-[var(--color-elevated)]" />
              <div className="h-4 w-full animate-pulse rounded bg-[var(--color-elevated)]" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--color-elevated)]" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-2 px-6 py-16 text-center">
        <span className="text-4xl">📭</span>
        <p className="font-medium">Nothing here yet</p>
        <p className="text-sm text-muted">Paste or share a link to start your catalog.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
