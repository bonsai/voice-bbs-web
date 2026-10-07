"use client";
import { useEffect, useMemo, useState } from "react";
import { bubbleSizePx } from "@/lib/audioCodec";

interface Thread {
  id: string;
  category_id: string;
  title?: string;
  total_duration?: number;
  post_count?: number;
  color?: string;
  latest_audio_url?: string;
}

// kids 最小サイズ (docs/ux-kids.md §7: 泡は80px以上)
const KIDS_MIN_PX = 88;
const HIDDEN_KEY = "vbbs-hidden-rooms";

function loadHidden(): Set<string> {
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export default function BubbleField({
  threads,
  onSelect,
  kids = false,
}: {
  threads: Thread[];
  onSelect: (t: Thread) => void;
  kids?: boolean;
}) {
  // こまったとき → みえなくした部屋 (端末内のみ。サーバ通報箱は次期対応)
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [thanks, setThanks] = useState(false);

  // kids が後から有効化される (属性ルーターはマウント後に判定) ので追従する
  useEffect(() => {
    if (kids) setHidden(loadHidden());
  }, [kids]);

  const bubbles = useMemo(() => {
    return threads
      .filter((t) => !hidden.has(t.id))
      .map((t) => {
        const raw = bubbleSizePx(t.total_duration || 1);
        const size = kids ? Math.max(raw, KIDS_MIN_PX) : raw;
        const x = Math.random() * 80 + 10; // 10~90%
        const y = Math.random() * 70 + 15; // 15~85%
        const dur = 6 + Math.random() * 8; // 6~14s
        const delay = Math.random() * -10;
        return { ...t, size, x, y, dur, delay };
      });
  }, [threads, hidden, kids]);

  const confirmHide = (id: string) => {
    const next = new Set(hidden);
    next.add(id);
    setHidden(next);
    try {
      localStorage.setItem(HIDDEN_KEY, JSON.stringify([...next]));
    } catch {
      /* private mode ではセッション内のみ有効 */
    }
    setPendingId(null);
    setThanks(true);
    window.setTimeout(() => setThanks(false), 2500);
  };

  return (
    <div className="relative w-full h-[70vh] overflow-hidden">
      {kids && thanks && (
        <p className="absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#0F2A44] shadow-lg">
          おしらせしたよ。みえなくしたよ
        </p>
      )}
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.x}%`,
            top: `${b.y}%`,
            transform: "translate(-50%, -50%)",
            animation: `float ${b.dur}s ease-in-out infinite alternate`,
            animationDelay: `${b.delay}s`,
          }}
        >
          <button
            onClick={() => onSelect(b)}
            aria-label={(b.title || b.category_id) + (kids ? " に はいる" : "")}
            className="bubble-sphere relative flex h-full w-full items-center justify-center overflow-hidden font-semibold text-white/90"
            style={{
              backgroundImage: b.latest_audio_url ? `url(${b.latest_audio_url})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: kids ? `${b.color}55` : undefined,
              borderRadius: "50%",
              border: `2px solid ${b.color}88`,
              // 球体陰影 + 縁の光 + 浮遊感
              boxShadow: `
                inset -12px -12px 24px rgba(0,0,0,0.6),
                inset 8px 8px 20px rgba(255,255,255,0.25),
                0 0 0 1px ${b.color}44,
                0 4px 20px ${b.color}55,
                0 0 40px ${b.color}33
              `,
            }}
          >
            {/* 左上ハイライト（光の反射） */}
            <span
              className="pointer-events-none absolute rounded-full opacity-60"
              style={{
                width: b.size * 0.35,
                height: b.size * 0.2,
                top: b.size * 0.12,
                left: b.size * 0.15,
                background: "radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)",
                transform: "rotate(-35deg)",
              }}
            />
            {/* タイトル（画像がない場合 or ホバー時） */}
            <span
              className={`relative z-10 px-2 text-center leading-tight drop-shadow-md transition-opacity ${kids ? "text-sm font-bold" : "text-xs"}`}
              style={{
                opacity: b.latest_audio_url ? 0 : 1,
              }}
            >
              {b.title || b.category_id}
            </span>
          </button>
          {/* こまったときボタン (kidsのみ。2タップ確認でみえなくする) */}
          {kids &&
            (pendingId === b.id ? (
              <span className="absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 gap-1 whitespace-nowrap">
                <button
                  onClick={() => confirmHide(b.id)}
                  className="min-h-[44px] rounded-full bg-red-500 px-3 text-xs font-bold text-white shadow-lg"
                >
                  おしらせする
                </button>
                <button
                  onClick={() => setPendingId(null)}
                  aria-label="やめる"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white text-base font-bold text-[#0F2A44] shadow-lg"
                >
                  ×
                </button>
              </span>
            ) : (
              <button
                onClick={() => setPendingId(b.id)}
                aria-label="こまったとき"
                title="こまったとき"
                className="absolute -top-1 -right-1 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border-2 border-white bg-amber-400 text-lg shadow-lg"
              >
                🚨
              </button>
            ))}
        </div>
      ))}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translate(-50%, -50%) translateY(0px) translateX(0px); }
          100% { transform: translate(-50%, -50%) translateY(-30px) translateX(15px); }
        }
        .bubble-sphere:hover {
          box-shadow: inset -12px -12px 24px rgba(0,0,0,0.5), inset 8px 8px 20px rgba(255,255,255,0.35), 0 0 0 2px rgba(255,255,255,0.3), 0 8px 40px rgba(255,255,255,0.2) !important;
        }
      `}</style>
    </div>
  );
}
