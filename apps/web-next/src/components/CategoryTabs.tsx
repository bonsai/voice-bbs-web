"use client";

export default function CategoryTabs({
  categories,
  active,
  onChange,
}: {
  categories: { id: string; name: string; color: string }[];
  active: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1 rounded-full text-sm font-medium transition ${
          active === null ? "bg-white text-black" : "bg-white/10 text-white/80 hover:bg-white/20"
        }`}
      >
        すべて
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className="px-3 py-1 rounded-full text-sm font-medium transition"
          style={{
            background: active === c.id ? c.color : `${c.color}33`,
            color: active === c.id ? "#fff" : c.color,
          }}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
