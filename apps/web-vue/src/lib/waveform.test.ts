import { describe, expect, it } from 'vitest'
import { pcmToWav } from './wav'
import { waveformSvgDataUri } from './waveform'

describe('waveformSvgDataUri', () => {
  it('WAV から SVG data-URI を生成する', () => {
    const sr = 8000
    const n = sr
    const t = Float32Array.from({ length: n }, (_, i) => Math.sin((2 * Math.PI * 440 * i) / sr) * 0.5)
    const wav = pcmToWav(t, sr)
    const uri = waveformSvgDataUri(wav, '#fff')
    expect(uri.startsWith('data:image/svg+xml,')).toBe(true)
    // URL エンコードされているが SVG 要素を含む
    expect(decodeURIComponent(uri.split(',')[1])).toContain('<svg')
    expect(decodeURIComponent(uri.split(',')[1])).toContain('<rect')
    // 16 本のバー
    expect((decodeURIComponent(uri.split(',')[1]).match(/<rect/g) ?? []).length).toBe(16)
    expect(uri).toContain('%23fff')
  })

  it('WAV でないバイト列は均等波形にフォールバックする', () => {
    const uri = waveformSvgDataUri(new Uint8Array([1, 2, 3, 4]), '#fff')
    expect(uri.startsWith('data:image/svg+xml,')).toBe(true)
    expect((decodeURIComponent(uri.split(',')[1]).match(/<rect/g) ?? []).length).toBe(16)
  })
})
