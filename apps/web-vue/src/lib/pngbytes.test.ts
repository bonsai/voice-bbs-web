import { describe, expect, it } from 'vitest'
import { computeCanvasSize, packBytesToRgba, unpackRgbaToBytes } from './pngbytes'

describe('computeCanvasSize', () => {
  it('全ピクセルがデータを格納できる寸法になる', () => {
    for (const len of [1, 3, 4, 100, 1000, 8044, 48000, 1_000_000]) {
      const { width, height } = computeCanvasSize(len)
      expect(width * height * 3).toBeGreaterThanOrEqual(4 + len)
      expect(width * height - (4 + len)).toBeLessThan(width * 3) // 無駄を最小に
    }
  })
})

describe('pack / unpack 往復', () => {
  it('実 WAV(8KB) が完全一致で復元される', () => {
    const data = new Uint8Array(8044)
    for (let i = 0; i < data.length; i++) data[i] = (i * 131 + 7) % 256
    const { width, height } = computeCanvasSize(data.length)
    const rgba = packBytesToRgba(data, width, height)
    expect(rgba.length).toBe(width * height * 4)
    // alpha は常に 255
    for (let i = 3; i < rgba.length; i += 4) expect(rgba[i]).toBe(255)
    expect(unpackRgbaToBytes(rgba)).toEqual(data)
  })

  it('1 バイトの極小データも復元できる', () => {
    const data = new Uint8Array([0xab])
    const { width, height } = computeCanvasSize(data.length)
    expect(unpackRgbaToBytes(packBytesToRgba(data, width, height))).toEqual(data)
  })

  it('末尾パディング(0埋め)は復元に影響しない', () => {
    const data = new Uint8Array(10)
    for (let i = 0; i < data.length; i++) data[i] = 255
    const { width, height } = computeCanvasSize(data.length)
    expect(unpackRgbaToBytes(packBytesToRgba(data, width, height))).toEqual(data)
  })

  it('長さヘッダはビッグエンディアン。4バイト目は alpha を挟んで rgba[4] に置かれる', () => {
    const data = new Uint8Array([1, 2, 3])
    const { width, height } = computeCanvasSize(data.length)
    const rgba = packBytesToRgba(data, width, height)
    // バイト列は [len0,len1,len2,len3, data...] → rgba [len0,len1,len2,A=255,len3,...]
    expect(rgba[0]).toBe(0) // len3=3 の最上位
    expect(rgba[1]).toBe(0)
    expect(rgba[2]).toBe(0)
    expect(rgba[3]).toBe(255) // alpha
    expect(rgba[4]).toBe(3) // 長さの最下位バイト
  })
})
