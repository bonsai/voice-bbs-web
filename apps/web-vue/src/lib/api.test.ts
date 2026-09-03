import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApi, getDeviceId, type StorageLike } from './api'

function memoryStorage(seed: Record<string, string> = {}): { storage: StorageLike; map: Map<string, string> } {
  const map = new Map(Object.entries(seed))
  return {
    storage: {
      getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
      setItem: (k: string, v: string) => void map.set(k, v),
    },
    map,
  }
}

describe('getDeviceId', () => {
  it('未保持なら生成して永続化する', () => {
    const { storage, map } = memoryStorage()
    const a = getDeviceId(storage)
    expect(a).toBeTruthy()
    expect(map.get('voice_bbs_device_id')).toBe(a)
    // 2回目は同じ値を返す
    expect(getDeviceId(storage)).toBe(a)
  })
})

describe('fetchJSON', () => {
  const realFetch = globalThis.fetch
  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })
  afterEach(() => {
    globalThis.fetch = realFetch
  })

  it('相対 BASE に JSON ヘッダ付きで GET する', async () => {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, categories: [] }),
    })
    const api = createApi(memoryStorage().storage)
    await api.categories()
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/categories',
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } }),
    )
  })

  it('非 2xx は status と error を含む例外になる', async () => {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: async () => ({ error: 'limit_reached' }),
    })
    const api = createApi(memoryStorage().storage)
    await expect(api.rooms()).rejects.toThrow('429 Too Many Requests: limit_reached')
  })

  it('POST に device_id を自動付与する', async () => {
    const { storage, map } = memoryStorage()
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, id: 'r1' }),
    })
    const api = createApi(storage)
    await api.createRoom({ category_id: 'want', title: 'hi' })
    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(init.body as string)
    expect(body.device_id).toBe(map.get('voice_bbs_device_id'))
  })
})
