import { describe, expect, it } from 'vitest'
import { app } from './[[route]]'

describe('Hono API', () => {
  it('GET /api/healthz returns ok', async () => {
    const response = await app.request('/api/healthz')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true, status: 'ok' })
  })
})
