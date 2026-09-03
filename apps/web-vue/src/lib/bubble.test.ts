import { describe, expect, it } from 'vitest'
import { MAX_DURATION, bubbleSizePx } from './bubble'

describe('bubbleSizePx', () => {
  it('0 秒 = 最小 56px', () => {
    expect(bubbleSizePx(0)).toBe(56)
  })

  it('30 秒 = 最大 160px', () => {
    expect(bubbleSizePx(MAX_DURATION)).toBe(160)
  })

  it('中間は線形 (15 秒 = 108px)', () => {
    expect(bubbleSizePx(15)).toBe(108)
  })

  it('30 秒超はクランプして 160px', () => {
    expect(bubbleSizePx(45)).toBe(160)
    expect(bubbleSizePx(Number.POSITIVE_INFINITY)).toBe(160)
  })

  it('負値は最小 56px にクランプ', () => {
    expect(bubbleSizePx(-1)).toBe(56)
  })
})
