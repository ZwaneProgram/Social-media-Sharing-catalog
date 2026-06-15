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

const platformLabel: Record<string, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  facebook: "Facebook",
  other: "Link",
};

export function ItemCard({ item }: { item: CatalogItem }) {
  return (
    <Link
      href={`/item/${item.id}`}
      className="group card overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-[var(--color-line-strong)] hover:shadow-xl hover:shadow-black/40"
    >
      <div className="relative aspect-video overflow-hidden bg-[var(--color-elevated)]">
        {item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-[var(--color-elevated)] to-[var(--color-surface)] text-4xl">
            {platformIcon[item.platform] ?? "🔗"}
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {platformIcon[item.platform] ?? "🔗"} {platformLabel[item.platform] ?? "Link"}
        </span>
      </div>
      <div className="space-y-1.5 p-3">
        {item.category && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
            style={{
              backgroundColor: `${item.category.color ?? "#7c5cff"}22`,
              color: item.category.color ?? "#c06bff",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: item.category.color ?? "#7c5cff" }}
            />
            {item.category.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{item.title}</h3>
        {item.note && (
          <p className="line-clamp-1 text-xs text-muted">{item.note}</p>
        )}
      </div>
    </Link>
  );
}
