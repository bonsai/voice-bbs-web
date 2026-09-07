import { describe, expect, it, vi } from 'vitest'
import { app } from './[[route]]'

function dbMock(overrides: Record<string, unknown> = {}) {
  const first = vi.fn(async () => null)
  const all = vi.fn(async () => ({ results: [] }))
  const run = vi.fn(async () => ({ success: true }))
  const prepare = vi.fn(() => ({
    bind: vi.fn(() => ({ first, all, run })),
    first,
    all,
    run,
  }))
  return { prepare, first, all, run, ...overrides }
}

describe('Hono API', () => {
  it('GET /api/healthz returns ok', async () => {
    const response = await app.request('/api/healthz')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true, status: 'ok' })
  })

  it('GET /api/categories returns categories from D1', async () => {
    const db = dbMock()
    db.all.mockResolvedValue({ results: [{ id: 'general', name: '一般' }] })

    const response = await app.request('/api/categories', {}, { DB: db as never, BUCKET: {} as never, R2_PUBLIC_URL: '' })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      categories: [{ id: 'general', name: '一般' }],
    })
  })

  it('GET /api/threads applies category, query and limit filters', async () => {
    const db = dbMock()
    db.all.mockResolvedValue({ results: [{ id: 'thread-1', category_id: 'general' }] })

    const response = await app.request('/api/threads?category=general&q=hello&limit=10', {}, {
      DB: db as never,
      BUCKET: {} as never,
      R2_PUBLIC_URL: '',
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      threads: [{ id: 'thread-1', category_id: 'general' }],
    })
    expect(db.prepare).toHaveBeenCalledTimes(1)
  })

  it('POST /api/threads rejects missing required fields', async () => {
    const response = await app.request('/api/threads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'missing ids' }),
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'missing' })
  })

  it('GET /api/threads/:id/posts returns posts from D1', async () => {
    const db = dbMock()
    db.all.mockResolvedValue({ results: [{ id: 'post-1', thread_id: 'thread-1' }] })

    const response = await app.request('/api/threads/thread-1/posts', {}, {
      DB: db as never,
      BUCKET: {} as never,
      R2_PUBLIC_URL: '',
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      posts: [{ id: 'post-1', thread_id: 'thread-1' }],
    })
  })
})
