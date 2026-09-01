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
          className="absolute rounded-full flex items-center justify-center text-white/90 font-semibold shadow-lg hover:scale-110 transition-transform cursor-pointer overflow-hidden"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.x}%`,
            top: `${b.y}%`,
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle at 30% 30%, ${b.color}88, ${b.color}33 60%, transparent 90%)`,
            border: `2px solid ${b.color}66`,
            boxShadow: `0 0 20px ${b.color}44`,
            animation: `float ${b.dur}s ease-in-out infinite alternate`,
            animationDelay: `${b.delay}s`,
          }}
        >
          <span className="text-xs px-2 text-center leading-tight">{b.title || b.category_id}</span>
        </button>
      ))}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translate(-50%, -50%) translateY(0px) translateX(0px); }
          100% { transform: translate(-50%, -50%) translateY(-30px) translateX(15px); }
        }
      `}</style>
    </div>
  );
}
