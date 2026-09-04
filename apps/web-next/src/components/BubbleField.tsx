"use client";
import { useMemo } from "react";
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

export default function BubbleField({
  threads,
  onSelect,
}: {
  threads: Thread[];
  onSelect: (t: Thread) => void;
}) {
  const bubbles = useMemo(() => {
    return threads.map((t) => {
      const size = bubbleSizePx(t.total_duration || 1);
      const x = Math.random() * 80 + 10; // 10~90%
      const y = Math.random() * 70 + 15; // 15~85%
      const dur = 6 + Math.random() * 8; // 6~14s
      const delay = Math.random() * -10;
      return { ...t, size, x, y, dur, delay };
    });
  }, [threads]);

  return (
    <div className="relative w-full h-[70vh] overflow-hidden">
      {bubbles.map((b) => (
        <button
          key={b.id}
          onClick={() => onSelect(b)}
          className="bubble-sphere absolute flex items-center justify-center text-white/90 font-semibold cursor-pointer overflow-hidden group"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.x}%`,
            top: `${b.y}%`,
            transform: "translate(-50%, -50%)",
            backgroundImage: b.latest_audio_url ? `url(${b.latest_audio_url})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
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
            animation: `float ${b.dur}s ease-in-out infinite alternate`,
            animationDelay: `${b.delay}s`,
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
          {/* 小さい二次反射 */}
          <span
            className="pointer-events-none absolute rounded-full opacity-40"
            style={{
              width: b.size * 0.1,
              height: b.size * 0.06,
              top: b.size * 0.25,
              left: b.size * 0.3,
              background: "radial-gradient(ellipse at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
              transform: "rotate(-35deg)",
            }}
          />
          {/* タイトル（画像がない場合 or ホバー時） */}
          <span
            className="relative z-10 text-xs px-2 text-center leading-tight drop-shadow-md transition-opacity"
            style={{
              opacity: b.latest_audio_url ? 0 : 1,
            }}
          >
            {b.title || b.category_id}
          </span>
        </button>
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
