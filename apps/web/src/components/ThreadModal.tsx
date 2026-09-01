"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import Recorder from "./Recorder";

interface Post {
  id: string;
  audio_url: string;
  duration: number;
  content?: string;
  device_id: string;
}

export default function ThreadModal({
  thread,
  onClose,
  onUpdate,
}: {
  thread: { id: string; title?: string; color?: string };
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { playingId, progress, playOne, playAll } = useAudioPlayer(posts);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.posts(thread.id);
      setPosts(data.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [thread.id]);

  useEffect(() => {
    if (!loading && posts.length > 0) {
      const t = setTimeout(() => playAll(), 400);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const handleUpload = async (base64: string, duration: number) => {
    try {
      await api.createPost(thread.id, { image_base64: base64, duration });
      await load();
      onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md h-[80vh] bg-slate-900 rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-white font-semibold truncate" style={{ color: thread.color }}>
            {thread.title || "スレッド"}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {loading && <p className="text-white/50 text-center">読み込み中…</p>}
          {posts.map((p) => (
            <button
              key={p.id}
              onClick={() => playOne(p)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                playingId === p.id ? "bg-white/20 ring-1 ring-white/30" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                {playingId === p.id ? (
                  <span className="animate-pulse text-white">▶</span>
                ) : (
                  <span className="text-white/70">▶</span>
                )}
                {playingId === p.id && (
                  <svg className="absolute inset-0 w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke={thread.color || "#fff"}
                      strokeWidth="2"
                      strokeDasharray={`${progress * 100} 100`}
                      className="transition-all"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-white/90 text-sm truncate">{p.content || "音声メッセージ"}</p>
                <p className="text-white/40 text-xs">{p.duration.toFixed(1)}s</p>
              </div>
            </button>
          ))}
          {!loading && posts.length === 0 && (
            <p className="text-white/40 text-center">まだ声がありません。最初の声を残しましょう。</p>
          )}
        </div>

        <div className="p-3 border-t border-white/10">
          <Recorder onUpload={handleUpload} />
        </div>
      </div>
    </div>
  );
}
