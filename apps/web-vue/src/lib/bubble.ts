// 泡サイズ計算 — Next 実装 (audioCodec.ts) の純関数移植
export const MAX_DURATION = 30

/** 声の長さ(秒) → 泡の直径 px。30 秒で最大、それ以上はクランプ */
export function bubbleSizePx(duration: number): number {
  const scale = Math.max(0, Math.min(duration / MAX_DURATION, 1))
  return Math.round(56 + scale * 104)
}
