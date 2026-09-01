"use client";
import { useCallback, useRef, useState } from "react";
import { encodeBytesAsPNG, trimWebmToWav } from "@/lib/audioCodec";

export function useAudioRecorder(
  onUpload: (base64: string, duration: number) => Promise<void>
) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [previewSize, setPreviewSize] = useState(0);
  const [canRecord, setCanRecord] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const animRef = useRef<number | null>(null);
  const maxVolRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cleanupAudio = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  const drawWaveform = useCallback(() => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;
    animRef.current = requestAnimationFrame(drawWaveform);
    const arr = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(arr);
    const frameMax = Math.max(...arr);
    if (frameMax > maxVolRef.current) maxVolRef.current = frameMax;

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    if (w === 0 || h === 0) return;
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    const c = canvas.getContext("2d")!;
    c.scale(devicePixelRatio, devicePixelRatio);
    c.clearRect(0, 0, w, h);

    const barCount = arr.length;
    const barW = w / barCount;
    const halfH = h / 2;
    for (let i = 0; i < barCount; i++) {
      const val = arr[i] / 255;
      const barH = val * halfH * 0.9;
      const x = i * barW;
      const y = halfH - barH / 2;
      const t = i / barCount;
      const r = Math.round(168 + t * 68);
      const g = Math.round(85 - t * 13);
      const b = Math.round(247 - t * 108);
      c.fillStyle = `rgba(${r},${g},${b},0.7)`;
      c.fillRect(x + 0.5, y, Math.max(barW - 1, 1), barH);
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!canRecord) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, {
        mimeType: mime,
        audioBitsPerSecond: 32000,
      });
      mediaRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        cleanupAudio();
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        setPreviewSize(0);
        if (timerRef.current) clearInterval(timerRef.current);
        if (chunksRef.current.length === 0) return;
        if (maxVolRef.current < 5) {
          setError("volume_low");
          return;
        }
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const ab = await blob.arrayBuffer();
        const { wavBytes, duration } = await trimWebmToWav(ab);
        if (duration < 0.3) {
          setError("too_short");
          return;
        }
        const base64 = await encodeBytesAsPNG(wavBytes);
        await onUpload(base64, duration);
      };

      recorder.start();
      startRef.current = Date.now();
      setRecording(true);
      maxVolRef.current = 0;

      // waveform
      const audioCtx = new AudioContext();
      ctxRef.current = audioCtx;
      const src = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;
      src.connect(analyser);
      drawWaveform();

      timerRef.current = setInterval(() => {
        const e = Math.min((Date.now() - startRef.current) / 1000, 30);
        setElapsed(e);
        setPreviewSize(Math.round(56 + Math.min(e / 30, 1) * 104));
      }, 100);
    } catch (e) {
      console.error(e);
      setError("mic_denied");
    }
  }, [canRecord, cleanupAudio, drawWaveform, onUpload]);

  const stopRecording = useCallback(() => {
    if (mediaRef.current && mediaRef.current.state === "recording") {
      mediaRef.current.stop();
    }
  }, []);

  const setCanvas = useCallback((el: HTMLCanvasElement | null) => {
    canvasRef.current = el;
  }, []);

  return {
    recording,
    elapsed,
    previewSize,
    error,
    startRecording,
    stopRecording,
    setCanvas,
    setCanRecord,
  };
}
