// 属性ルーター: 年代・属性 → テーマ分岐 (docs/ux-kids.md §4)
// ?kids=1 / ?age=10 の両対応。static export のため window.location.search を読む。

export type AgeBand = "kids" | "junior" | "adult";

export interface RouteAttr {
  kids: boolean;
  age: number | null;
  band: AgeBand;
  /** 空色kids / ダーク大人 を切替る main class */
  mainClass: string;
}

const KIDS_MAIN =
  "min-h-screen bg-gradient-to-b from-[#BFE9FF] via-white to-[#DFF7FF] text-[#0F2A44]";
const ADULT_MAIN =
  "min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white";

export function resolveAttr(search: string): RouteAttr {
  const q = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const kidsFlag = q.get("kids") === "1";
  const ageRaw = q.get("age");
  const age = ageRaw !== null && ageRaw !== "" && Number.isFinite(Number(ageRaw)) ? Number(ageRaw) : null;

  // 年代帯: kids Flag優先、なければ age で判定 (10歳→kids、13〜17→junior扱いで大人UI+大きめ)
  let band: AgeBand = "adult";
  if (kidsFlag || (age !== null && age <= 12)) band = "kids";
  else if (age !== null && age <= 17) band = "junior";

  return {
    kids: band === "kids",
    age,
    band,
    mainClass: band === "kids" ? KIDS_MAIN : ADULT_MAIN,
  };
}

/** 初回おやくそくが必要か (kids のみ) */
export function needsPromise(band: AgeBand, seen: boolean): boolean {
  return band === "kids" && !seen;
}
