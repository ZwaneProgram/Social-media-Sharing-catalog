import Link from "next/link";

export interface CatalogItem {
  id: string;
  url: string;
  title: string;
  thumbnailUrl: string | null;
  platform: string;
  note: string | null;
  categoryId: string | null;
  category: { id: string; name: string; color: string | null } | null;
  createdAt: string;
}

const platformIcon: Record<string, string> = {
  youtube: "▶️",
  instagram: "📷",
  facebook: "📘",
  other: "🔗",
};

export function ItemCard({ item }: { item: CatalogItem }) {
  return (
    <Link
      href={`/item/${item.id}`}
      className="block rounded-xl overflow-hidden border hover:shadow-lg transition"
    >
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        {item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">{platformIcon[item.platform] ?? "🔗"}</span>
        )}
      </div>
      <div className="p-3 space-y-1">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>{platformIcon[item.platform] ?? "🔗"}</span>
          {item.category && (
            <span
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: item.category.color ?? "#eee" }}
            >
              {item.category.name}
            </span>
          )}
        </div>
        <h3 className="font-medium line-clamp-2">{item.title}</h3>
        {item.note && (
          <p className="text-sm text-gray-500 line-clamp-1">{item.note}</p>
        )}
      </div>
    </Link>
  );
}
