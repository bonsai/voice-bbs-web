"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

export default function Recorder({ onUpload }: { onUpload: (base64: string, duration: number) => Promise<void> }) {
  const { recording, elapsed, previewSize, error, startRecording, stopRecording, setCanvas } = useAudioRecorder(onUpload);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [remaining, setRemaining] = useState(4);

  useEffect(() => {
    api.count(api.deviceId()).then((d) => setRemaining(d.remaining));
  }, []);

  useEffect(() => {
    setCanvas(canvasRef.current);
  }, [setCanvas]);

  const active = recording && remaining > 0;

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
