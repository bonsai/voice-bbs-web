"use client";

// おやくそくシート (初回のみ表示, docs/ux-kids.md §3)
// 「ほんみょう・がっこう・ばしょ・でんわばんごうは いわないでね」→ [わかった!]

export const PROMISE_KEY = "vbbs-promise-ok";

export function promiseSeen(): boolean {
  try {
    return localStorage.getItem(PROMISE_KEY) === "1";
  } catch {
    return false;
  }
}

export function promiseDone(): void {
  try {
    localStorage.setItem(PROMISE_KEY, "1");
  } catch {
    /* private mode などでは諦める (毎回表示になるだけ) */
  }
}

export default function PromiseSheet({ onOk }: { onOk: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F2A44]/60 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
        <p className="text-4xl" aria-hidden>
          🫧
        </p>
        <h3 className="mt-2 text-xl font-bold text-[#0F2A44]">おやくそく</h3>
        <ul className="mt-4 space-y-3 text-left text-base font-bold text-[#0F2A44]">
          <li>🙅 ほんみょうは いわない</li>
          <li>🏫 がっこう・ばしょは いわない</li>
          <li>📞 でんわばんごうは いわない</li>
        </ul>
        <p className="mt-4 text-sm font-bold text-[#0F2A44]/70">やさしい こえで はなそうね</p>
        <button
          onClick={onOk}
          className="mt-5 min-h-[64px] w-full rounded-2xl bg-pink-500 text-xl font-bold text-white transition hover:bg-pink-400"
        >
          わかった！
        </button>
      </div>
    </div>
  );
}
