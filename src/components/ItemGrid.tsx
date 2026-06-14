import { ItemCard, type CatalogItem } from "@/components/ItemCard";

export function ItemGrid({ items }: { items: CatalogItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-center text-gray-400 py-12">
        Nothing here yet. Paste a link to get started.
      </p>
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
