import { describe, expect, it } from 'vitest'
import { trimSilence } from './silence'

const SR = 8000

function tone(durMs: number, freq = 440, amp = 0.5, startMs = 0): Float32Array {
  const n = Math.floor((SR * durMs) / 1000)
  const out = new Float32Array(n)
  const s0 = Math.floor((SR * startMs) / 1000)
  for (let i = s0; i < n; i++) {
    out[i] = Math.sin((2 * Math.PI * freq * (i - s0)) / SR) * amp
  }
  return out
}

describe('trimSilence', () => {
  it('前後に無音があると音声区間(+pad)へカットされる', () => {
    // 頭 300ms 無音 + 500ms トーン + 末尾 300ms 無音
    const n = Math.floor((SR * 1100) / 1000)
    const s = new Float32Array(n)
    const t = tone(500, 440, 0.5)
    s.set(t, Math.floor((SR * 300) / 1000))
    const out = trimSilence(s, { sampleRate: SR })
    // 300ms(2400 sample) - pad 50ms(400) から開始
    expect(out[0]).toBe(0)
    expect(out.length).toBeLessThan(n)
    // トーン本体が含まれる
    expect(out.some((v) => v > 0.4)).toBe(true)
  })

  it('全体が無音なら全体を返す(無音すぎ判定)', () => {
    const s = new Float32Array(SR)
    const out = trimSilence(s, { sampleRate: SR })
    expect(out).toEqual(s)
    expect(out.length).toBe(SR)
  })

  it('極短の声(100ms 未満)は全体を返す', () => {
    const s = tone(80, 440, 0.5)
    const out = trimSilence(s, { sampleRate: SR })
    expect(out.length).toBe(s.length)
  })

  it('無音なしの音声はほぼそのまま', () => {
    const s = tone(1000)
    const out = trimSilence(s, { sampleRate: SR })
    expect(out.length).toBeGreaterThanOrEqual(s.length - SR / 10)
  })
})
