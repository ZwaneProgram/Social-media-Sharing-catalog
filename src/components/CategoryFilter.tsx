"use client";

export interface Category {
  id: string;
  name: string;
  color: string | null;
}

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1 rounded-full text-sm border ${
          selected === null ? "bg-black text-white" : ""
        }`}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`px-3 py-1 rounded-full text-sm border ${
            selected === c.id ? "bg-black text-white" : ""
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
