import { describe, expect, it } from 'vitest'

const rooms = ['テスト雑談部屋', 'アイデア部屋']

describe('React PoC comparison fixtures', () => {
  it('defines the minimum lobby fixtures', () => {
    expect(rooms).toContain('テスト雑談部屋')
  })
})
