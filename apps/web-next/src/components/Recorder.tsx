"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import PromiseSheet, { promiseDone, promiseSeen } from "./PromiseSheet";

// kids 録音の上限 (docs/ux-kids.md §3: 10秒で自動ストップ)
const KIDS_MAX_SEC = 10;

const KIDS_ERROR: Record<string, string> = {
  volume_low: "こえが ちいさいよ もういちど！",
  too_short: "みじかすぎるよ もういちど！",
  mic_denied: "マイクを きょかしてね",
};

export default function Recorder({
  onUpload,
  kids = false,
}: {
  onUpload: (base64: string, duration: number) => Promise<void>;
  kids?: boolean;
}) {
  // kids: エンコード済み音声をいったん手元に置き [おくる] で投稿する
  const [ready, setReady] = useState<{ base64: string; duration: number } | null>(null);
  const [sending, setSending] = useState(false);
  const [showPromise, setShowPromise] = useState(false);
  const stash = useCallback(async (base64: string, duration: number) => {
    setReady({ base64, duration });
  }, []);
  const { recording, elapsed, previewSize, error, startRecording, stopRecording, setCanvas } = useAudioRecorder(
    kids ? stash : onUpload
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [remaining, setRemaining] = useState(4);

  const refreshCount = useCallback(() => {
    api.count(api.deviceId()).then((d) => setRemaining(d.remaining));
  }, []);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  useEffect(() => {
    setCanvas(canvasRef.current);
  }, [setCanvas]);

  // kids: 10秒で自動ストップ
  useEffect(() => {
    if (kids && recording && elapsed >= KIDS_MAX_SEC) {
      stopRecording();
      refreshCount();
    }
  }, [kids, recording, elapsed, stopRecording, refreshCount]);

  const active = recording && remaining > 0;

  // --- kids 2タップフロー ---
  const handleMicTap = () => {
    if (recording) {
      stopRecording();
      refreshCount();
      return;
    }
    if (ready || remaining <= 0) return;
    if (!promiseSeen()) {
      setShowPromise(true);
      return;
    }
    startRecording();
  };

  const handlePromiseOk = () => {
    promiseDone();
    setShowPromise(false);
    startRecording();
  };

  const handleSend = async () => {
    if (!ready || sending) return;
    setSending(true);
    try {
      await onUpload(ready.base64, ready.duration);
      setReady(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (kids) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center">
          {/* Preview bubble */}
          <div
            className={`rounded-full bg-sky-200/60 transition-all duration-100 ${active ? "opacity-100" : "opacity-0"}`}
            style={{ width: previewSize, height: previewSize }}
          />
          {/* Big mic button: 80px (docs/ux-kids.md §7) */}
          <button
            onClick={handleMicTap}
            aria-label={recording ? "ろくおんを おわる" : "ろくおんを はじめる"}
            className={`absolute inset-0 m-auto h-20 w-20 rounded-full border-4 text-3xl transition-transform ${
              active
                ? "scale-110 border-red-400 bg-red-100"
                : "border-[#0F2A44]/20 bg-white shadow-lg hover:scale-105"
            }`}
          >
            🎤
          </button>
        </div>

        <canvas ref={canvasRef} className="h-12 w-48" />

        <p className="min-h-[1.5rem] text-base font-bold text-[#0F2A44]">
          {ready
            ? `${ready.duration.toFixed(1)}びょう とれたよ！`
            : active
              ? `はなしてね！ あと${Math.max(KIDS_MAX_SEC - Math.floor(elapsed), 0)}びょう (おして おわり)`
              : "マイクを おして はなす"}
        </p>

        {ready && (
          <div className="flex gap-3">
            <button
              onClick={() => setReady(null)}
              className="min-h-[56px] rounded-2xl border-2 border-[#0F2A44]/20 bg-white px-5 text-base font-bold text-[#0F2A44]"
            >
              やりなおし
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="min-h-[56px] rounded-2xl bg-pink-500 px-8 text-base font-bold text-white transition hover:bg-pink-400 disabled:opacity-50"
            >
              {sending ? "おくってる…" : "おくる"}
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#0F2A44]/70">あと {remaining} かい</span>
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-full ${i < 4 - remaining ? "bg-emerald-400" : "bg-[#0F2A44]/15"}`}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-sm font-bold text-red-500">{KIDS_ERROR[error] ?? error}</p>}

        {showPromise && <PromiseSheet onOk={handlePromiseOk} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Preview bubble */}
        <div
          className={`rounded-full bg-white/20 transition-all duration-100 ${active ? "opacity-100" : "opacity-0"}`}
          style={{ width: previewSize, height: previewSize }}
        />
        {/* Record button */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            if (remaining > 0) startRecording();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            stopRecording();
            api.count(api.deviceId()).then((d) => setRemaining(d.remaining));
          }}
          onPointerLeave={() => {
            if (recording) stopRecording();
          }}
          className={`absolute inset-0 m-auto w-16 h-16 rounded-full border-4 transition-transform ${
            active ? "scale-110 border-red-400 bg-red-500/20" : "border-white/30 bg-white/10 hover:bg-white/20"
          }`}
        />
      </div>

      <canvas ref={canvasRef} className="w-48 h-12" />

      <div className="flex items-center gap-2">
        <span className="text-white/60 text-xs">
          {active ? `0:${Math.floor(elapsed).toString().padStart(2, "0")} / 0:30` : "長押しで録音"}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i < 4 - remaining ? "bg-emerald-400" : "bg-white/20"}`}
            />
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-300 text-xs">
          {error === "volume_low" && "音量が小さすぎます"}
          {error === "too_short" && "短すぎます"}
          {error === "mic_denied" && "マイクを許可してください"}
        </p>
      )}
    </div>
  );
}
