import { describe, expect, it } from 'vitest'
import { app } from './[[route]]'

describe('Hono API contract', () => {
  it.each([
    ['/api/healthz', 'GET'],
    ['/api/categories', 'GET'],
    ['/api/threads', 'GET'],
    ['/api/threads/thread-1/posts', 'GET'],
    ['/api/count/device-1', 'GET'],
  ])('%s is registered for %s', async (path, method) => {
    const response = await app.request(path, { method }, {
      DB: {
        prepare: () => ({
          bind: () => ({ first: async () => ({ cnt: 0 }), all: async () => ({ results: [] }), run: async () => ({ success: true }) }),
        }),
      } as never,
      BUCKET: {} as never,
      R2_PUBLIC_URL: '',
    })

    expect(response.status).not.toBe(404)
  })

  it('GET /api/audio/:key returns 404 when R2 object is missing', async () => {
    const response = await app.request('/api/audio/missing.png', {}, {
      DB: {} as never,
      BUCKET: { get: async () => null } as never,
      R2_PUBLIC_URL: '',
    })

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'not_found' })
  })
})
