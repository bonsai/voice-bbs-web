// WAVバイト → 泡背景用 波形SVG data-URI (生PNGノイズを波形として描画し直す)
import { wavToPcm } from './wav'

const BAR_COUNT = 16

/** WAV バイト列をバー波形 SVG の data-URI に変換する */
export function waveformSvgDataUri(wav: Uint8Array, color: string): string {
  let bars: number[]
  try {
    const { samples } = wavToPcm(wav)
    bars = envelope(samples, BAR_COUNT)
  } catch {
    // WAV でない場合は均等な波形
    bars = Array.from({ length: BAR_COUNT }, () => 0.5)
  }
  const rects = bars
    .map((v, i) => {
      const x = (i / BAR_COUNT) * 100
      const h = Math.max(4, v * 100)
      const y = 50 - h / 2
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(100 / BAR_COUNT - 2).toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="${color}"/>`
    })
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">${rects}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** 振幅の絶対値平均 → 各バーの高さ(0..1) */
function envelope(samples: Float32Array, n: number): number[] {
  const out: number[] = []
  const step = Math.max(1, Math.floor(samples.length / n))
  for (let i = 0; i < n; i++) {
    const start = i * step
    const end = Math.min(samples.length, start + step)
    let sum = 0
    for (let j = start; j < end; j++) sum += Math.abs(samples[j])
    const avg = end > start ? sum / (end - start) : 0
    out.push(Math.min(0.5, avg * 0.08 + 0.08))
  }
  return out
}
