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
    await expect(response.json()).resolves.toEqual({ ok: true, categories: [{ id: 'general', name: '一般' }] })
  })

  it('GET /api/threads applies category, query and limit filters', async () => {
    const db = dbMock()
    db.all.mockResolvedValue({ results: [{ id: 'thread-1', category_id: 'general' }] })
    const response = await app.request('/api/threads?category=general&q=hello&limit=10', {}, { DB: db as never, BUCKET: {} as never, R2_PUBLIC_URL: '' })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true, threads: [{ id: 'thread-1', category_id: 'general' }] })
    expect(db.prepare).toHaveBeenCalledTimes(1)
  })

  it('POST /api/threads rejects missing required fields', async () => {
    const response = await app.request('/api/threads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: 'missing ids' }) })
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'missing' })
  })

  it('GET /api/threads/:id/posts returns posts from D1', async () => {
    const db = dbMock()
    db.all.mockResolvedValue({ results: [{ id: 'post-1', thread_id: 'thread-1' }] })
    const response = await app.request('/api/threads/thread-1/posts', {}, { DB: db as never, BUCKET: {} as never, R2_PUBLIC_URL: '' })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true, posts: [{ id: 'post-1', thread_id: 'thread-1' }] })
  })

  it('POST /api/threads/:id/posts rejects missing voice-post fields', async () => {
    const response = await app.request('/api/threads/thread-1/posts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ device_id: 'device-1' }) }, { DB: dbMock() as never, BUCKET: {} as never, R2_PUBLIC_URL: '' })
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'missing' })
  })

  it('POST /api/threads/:id/posts uploads the image and creates a post', async () => {
    const db = dbMock()
    db.first.mockResolvedValue({ cnt: 0 })
    const bucket = { put: vi.fn(async () => undefined), delete: vi.fn(async () => undefined) }
    const response = await app.request('/api/threads/thread-1/posts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ image_base64: 'aGVsbG8=', duration: 3.5, device_id: 'device-1', content: 'hello' }) }, { DB: db as never, BUCKET: bucket as never, R2_PUBLIC_URL: '' })
    expect(response.status).toBe(200)
    const body = await response.json() as { ok: boolean; id: string; url: string; remaining: number }
    expect(body.ok).toBe(true)
    expect(body.id).toEqual(expect.any(String))
    expect(body.url).toMatch(/^\/api\/audio\/.+\.png$/)
    expect(body.remaining).toBe(3)
    expect(bucket.put).toHaveBeenCalledTimes(1)
    expect(bucket.put).toHaveBeenCalledWith(expect.stringMatching(/^posts\/.+\.png$/), expect.any(Uint8Array), { httpMetadata: { contentType: 'image/png' } })
    expect(db.run).toHaveBeenCalledTimes(2)
    expect(db.all).toHaveBeenCalledTimes(1)
  })

  it('POST /api/threads/:id/posts rejects a device that reached the daily limit', async () => {
    const db = dbMock()
    db.first.mockResolvedValue({ cnt: 4 })
    const bucket = { put: vi.fn(), delete: vi.fn() }
    const response = await app.request('/api/threads/thread-1/posts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ image_base64: 'aGVsbG8=', duration: 3.5, device_id: 'device-1' }) }, { DB: db as never, BUCKET: bucket as never, R2_PUBLIC_URL: '' })
    expect(response.status).toBe(429)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'limit_reached' })
    expect(bucket.put).not.toHaveBeenCalled()
    expect(db.run).not.toHaveBeenCalled()
  })

  it('POST /api/threads/:id/posts removes posts beyond the 100-post cap', async () => {
    const db = dbMock()
    db.first.mockResolvedValue({ cnt: 0 })
    db.all.mockResolvedValue({ results: [{ id: 'old-post', audio_url: '/api/audio/old-post.png' }] })
    const bucket = { put: vi.fn(async () => undefined), delete: vi.fn(async () => undefined) }
    const response = await app.request('/api/threads/thread-1/posts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ image_base64: 'aGVsbG8=', duration: 2, device_id: 'device-1' }) }, { DB: db as never, BUCKET: bucket as never, R2_PUBLIC_URL: '' })
    expect(response.status).toBe(200)
    expect(db.run).toHaveBeenCalledTimes(3)
    expect(bucket.delete).toHaveBeenCalledWith('posts/old-post.png')
  })

  it('DELETE /api/posts/:id rejects missing device_id', async () => {
    const response = await app.request('/api/posts/post-1', { method: 'DELETE' }, { DB: dbMock() as never, BUCKET: {} as never, R2_PUBLIC_URL: '' })
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'missing_device_id' })
  })

  it('DELETE /api/posts/:id rejects a non-owner', async () => {
    const db = dbMock()
    db.first.mockResolvedValue({ device_id: 'owner-device', audio_url: '/api/audio/post-1.png' })
    const response = await app.request('/api/posts/post-1?device_id=other-device', { method: 'DELETE' }, { DB: db as never, BUCKET: {} as never, R2_PUBLIC_URL: '' })
    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'forbidden' })
    expect(db.run).not.toHaveBeenCalled()
  })

  it('DELETE /api/posts/:id deletes the owner post and R2 object', async () => {
    const db = dbMock()
    db.first.mockResolvedValue({ device_id: 'owner-device', audio_url: '/api/audio/post-1.png' })
    const bucket = { delete: vi.fn(async () => undefined) }
    const response = await app.request('/api/posts/post-1?device_id=owner-device', { method: 'DELETE' }, { DB: db as never, BUCKET: bucket as never, R2_PUBLIC_URL: '' })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true, deleted_by: 'owner' })
    expect(db.run).toHaveBeenCalledTimes(1)
    expect(bucket.delete).toHaveBeenCalledWith('posts/post-1.png')
  })

  it('DELETE /api/posts/:id allows the configured admin token', async () => {
    const db = dbMock()
    db.first.mockResolvedValue({ device_id: 'owner-device', audio_url: '/api/audio/post-1.png' })
    const bucket = { delete: vi.fn(async () => undefined) }
    const response = await app.request('/api/posts/post-1', { method: 'DELETE', headers: { 'X-Admin-Token': 'secret' } }, { DB: db as never, BUCKET: bucket as never, R2_PUBLIC_URL: '', ADMIN_TOKEN: 'secret' })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true, deleted_by: 'admin' })
  })
})
