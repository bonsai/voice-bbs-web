"use client";
import { useCallback, useRef, useState } from "react";
import { decodePNGToWav } from "@/lib/audioCodec";

interface Post {
  id: string;
  audio_url: string;
  duration: number;
}

export function useAudioPlayer(posts: Post[]) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const srcRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef(0);
  const pauseOffsetRef = useRef(0);
  const animRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (srcRef.current) {
      try {
        srcRef.current.stop();
      } catch {}
      srcRef.current = null;
    }
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
    setPlayingId(null);
    setProgress(0);
  }, []);

  const playOne = useCallback(
    async (post: Post, onEnded?: () => void) => {
      stop();
      try {
        const { audioBuffer } = await decodePNGToWav(post.audio_url);
        if (!ctxRef.current) ctxRef.current = new AudioContext();
        const ctx = ctxRef.current;
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        srcRef.current = source;
        startTimeRef.current = ctx.currentTime;
        pauseOffsetRef.current = 0;
        setPlayingId(post.id);

        const update = () => {
          if (!srcRef.current) return;
          const p = Math.min((ctx.currentTime - startTimeRef.current) / audioBuffer.duration, 1);
          setProgress(p);
          if (p < 1) animRef.current = requestAnimationFrame(update);
        };
        animRef.current = requestAnimationFrame(update);

        source.onended = () => {
          setPlayingId(null);
          setProgress(0);
          if (onEnded) onEnded();
        };
        source.start();
      } catch (e) {
        console.error(e);
        setPlayingId(null);
        if (onEnded) onEnded();
      }
    },
    [stop]
  );

  const playAll = useCallback(() => {
    let idx = 0;
    const run = () => {
      if (idx >= posts.length) {
        setPlayingId(null);
        return;
      }
      playOne(posts[idx], () => {
        idx++;
        run();
      });
    };
    run();
  }, [posts, playOne]);

  return { playingId, progress, playOne, playAll, stop };
}
