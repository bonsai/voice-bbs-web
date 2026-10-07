"use client";

// 10歳向け kids モード表示ラベル (docs/ux-kids.md §4.1)
// motetai は kids では一覧・作成の両方から除外する
export const KIDS_LABELS: Record<string, string> = {
  want: "きいてほしい",
  search: "さがしてる",
  trouble: "こまってる",
  motetai: "じまんしたい",
};

export const KIDS_HIDDEN_IDS = ["motetai"] as const;

export default function CategoryTabs({
  categories,
  active,
  onChange,
  kids = false,
}: {
  categories: { id: string; name: string; color: string }[];
  active: string | null;
  onChange: (id: string | null) => void;
  kids?: boolean;
}) {
  const visible = kids
    ? categories.filter((c) => !(KIDS_HIDDEN_IDS as readonly string[]).includes(c.id))
    : categories;
  const labelOf = (c: { id: string; name: string }) =>
    kids ? KIDS_LABELS[c.id] ?? c.name : c.name;
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3">
      <button
        onClick={() => onChange(null)}
        className={
          kids
            ? `min-h-[56px] px-4 rounded-full text-base font-bold transition ${
                active === null
                  ? "bg-[#0F2A44] text-white"
                  : "bg-white text-[#0F2A44] border-2 border-[#0F2A44]/20"
              }`
            : `px-3 py-1 rounded-full text-sm font-medium transition ${
                active === null ? "bg-white text-black" : "bg-white/10 text-white/80 hover:bg-white/20"
              }`
        }
      >
        {kids ? "ぜんぶ" : "すべて"}
      </button>
      {visible.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={
            kids
              ? "min-h-[56px] min-w-[56px] px-4 rounded-full text-base font-bold transition border-2"
              : "px-3 py-1 rounded-full text-sm font-medium transition"
          }
          style={{
            background: active === c.id ? c.color : `${c.color}33`,
            color: active === c.id ? "#fff" : c.color,
          }}
        >
          {labelOf(c)}
        </button>
      ))}
    </div>
  );
}
