import { ItemCard, type CatalogItem } from "@/components/ItemCard";

export function ItemGrid({ items }: { items: CatalogItem[] }) {
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
