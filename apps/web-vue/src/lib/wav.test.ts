import { describe, expect, it } from 'vitest'
import { pcmToWav, wavToPcm } from './wav'

function header(wav: Uint8Array) {
  const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength)
  return {
    riff: String.fromCharCode(...wav.slice(0, 4)),
    size: view.getUint32(4, true),
    wave: String.fromCharCode(...wav.slice(8, 12)),
    fmt: view.getUint16(20, true),
    channels: view.getUint16(22, true),
    sampleRate: view.getUint32(24, true),
    byteRate: view.getUint32(28, true),
    bits: view.getUint16(34, true),
    dataSize: view.getUint32(40, true),
  }
}

describe('pcmToWav', () => {
  it('RIFF/WAVE ヘッダと基本フィールドが正しい', () => {
    const wav = pcmToWav(new Float32Array(8000), 8000, 1)
    const h = header(wav)
    expect(h.riff).toBe('RIFF')
    expect(h.wave).toBe('WAVE')
    expect(h.fmt).toBe(1)
    expect(h.channels).toBe(1)
    expect(h.sampleRate).toBe(8000)
    expect(h.bits).toBe(16)
    expect(h.dataSize).toBe(8000 * 2)
    expect(wav.length).toBe(44 + 8000 * 2)
  })

  it('float→int16 変換が Next 実装と同式(クリップ含む)', () => {
    const wav = pcmToWav(new Float32Array([1, -1, 0, 2, -2, 0.5]), 8000)
    const view = new DataView(wav.buffer)
    expect(view.getInt16(44, true)).toBe(32767)
    expect(view.getInt16(46, true)).toBe(-32768)
    expect(view.getInt16(48, true)).toBe(0)
    expect(view.getInt16(50, true)).toBe(32767) // クリップ
    expect(view.getInt16(52, true)).toBe(-32768)
    // 0.5*0x7fff は浮動小数点で 16383.4999... → ToInt16 で 16383(Next 実装と同挙動)
    expect(view.getInt16(54, true)).toBe(16383)
  })

  it('wavToPcm で往復できる(440Hz)', () => {
    const sr = 8000
    const n = sr / 2
    const t = Float32Array.from({ length: n }, (_, i) => Math.sin((2 * Math.PI * 440 * i) / sr) * 0.5)
    const wav = pcmToWav(t, sr)
    const { samples, sampleRate } = wavToPcm(wav)
    expect(sampleRate).toBe(sr)
    expect(samples.length).toBe(n)
    // 位相誤差 ±0.02 以内(量子化)
    for (let i = 0; i < n; i += 97) expect(Math.abs(samples[i] - t[i])).toBeLessThan(0.02)
  })
})
