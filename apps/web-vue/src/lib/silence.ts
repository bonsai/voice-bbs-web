// 無音トリム — 純関数(node でテスト可能)
// Next 実装 trimWebmToWav の RMS スライディング窓ロジックをサンプル列に一般化

export interface TrimOptions {
  sampleRate: number
  /** 窓長 ms(既定 20) */
  windowMs?: number
  /** RMS 閾値(既定 0.003) */
  threshold?: number
  /** 前後パディング ms(既定 50) */
  padMs?: number
  /** これより短い区間なら全体を返す ms(既定 100) */
  minKeepMs?: number
}

/** 前後の無音をカットしたサンプル列を返す。ほぼ無音/極短は全体を返す */
export function trimSilence(samples: Float32Array, opts: TrimOptions): Float32Array {
  const { sampleRate, windowMs = 20, threshold = 0.003, padMs = 50, minKeepMs = 100 } = opts
  const windowSize = Math.floor((sampleRate * windowMs) / 1000)
  const n = samples.length
  if (n === 0 || windowSize <= 0) return samples

  let rmsWindow = 0
  for (let i = 0; i < Math.min(windowSize, n); i++) rmsWindow += samples[i] * samples[i]

  let startSample = 0
  for (let i = 0; i < n - windowSize; i++) {
    const rms = Math.sqrt(rmsWindow / windowSize)
    if (rms > threshold) {
      startSample = Math.max(0, i - Math.floor((sampleRate * padMs) / 1000))
      break
    }
    rmsWindow -= samples[i] * samples[i]
    rmsWindow += samples[i + windowSize] * samples[i + windowSize]
  }

  rmsWindow = 0
  for (let i = Math.max(0, n - windowSize); i < n; i++) rmsWindow += samples[i] * samples[i]

  let endSample = n
  for (let i = n - 1; i >= windowSize; i--) {
    const rms = Math.sqrt(rmsWindow / windowSize)
    if (rms > threshold) {
      endSample = Math.min(n, i + Math.floor((sampleRate * padMs) / 1000))
      break
    }
    rmsWindow -= samples[i] * samples[i]
    rmsWindow += samples[i - windowSize] * samples[i - windowSize]
  }

  if (endSample - startSample < Math.floor((sampleRate * minKeepMs) / 1000)) {
    return samples // 無音すぎ/短すぎ → 全体
  }
  return samples.slice(startSample, endSample)
}
