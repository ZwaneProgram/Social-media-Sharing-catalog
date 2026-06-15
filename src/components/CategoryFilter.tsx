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
        className={selected === null ? "chip chip-active" : "chip"}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={selected === c.id ? "chip chip-active" : "chip"}
        >
          {c.color && (
            <span
              className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
              style={{ backgroundColor: c.color }}
            />
          )}
          {c.name}
        </button>
      ))}
    </div>
  );
}
