/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'

type Env = {
  Bindings: {
    DB: D1Database
    BUCKET: R2Bucket
    R2_PUBLIC_URL: string
  }
}

const app = new Hono<Env>().basePath('/api')

// healthz
app.get('/healthz', (c) => c.json({ ok: true, status: 'ok' }))

// categories
app.get('/categories', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM categories ORDER BY id').all()
  return c.json({ ok: true, categories: results })
})

// threads list (with optional search via FTS5)
app.get('/threads', async (c) => {
  const category = c.req.query('category')
  const q = c.req.query('q')
  const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 100)

  let sql = `SELECT t.*, COALESCE(SUM(p.duration),0) as total_duration, COUNT(p.id) as post_count FROM threads t LEFT JOIN posts p ON t.id = p.thread_id`
  const where: string[] = []
  const params: (string | number)[] = []

  if (category) {
    where.push('t.category_id = ?')
    params.push(category)
  }
  if (q) {
    where.push(`t.id IN (SELECT thread_id FROM posts WHERE content LIKE ?)`)
    params.push('%' + q + '%')
  }
  if (where.length) sql += ' WHERE ' + where.join(' AND ')
  sql += ` GROUP BY t.id ORDER BY t.created_at DESC LIMIT ?`
  params.push(limit)

  const stmt = c.env.DB.prepare(sql)
  const { results } = await stmt.bind(...params).all()
  return c.json({ ok: true, threads: results })
})

// create thread
app.post('/threads', async (c) => {
  const body = await c.req.json<{ category_id: string; title?: string; device_id: string }>()
  if (!body.category_id || !body.device_id) return c.json({ ok: false, error: 'missing' }, 400)

  const rate = await c.env.DB.prepare(
    `SELECT COUNT(*) as cnt FROM (
      SELECT 1 FROM threads WHERE device_id = ? AND created_at >= unixepoch('now','start of day')
      UNION ALL
      SELECT 1 FROM posts WHERE device_id = ? AND created_at >= unixepoch('now','start of day')
    )`
  ).bind(body.device_id, body.device_id).first<{ cnt: number }>()
  if ((rate?.cnt ?? 0) >= 4) return c.json({ ok: false, error: 'limit_reached' }, 429)

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO threads (id, category_id, title, device_id) VALUES (?, ?, ?, ?)`
  ).bind(id, body.category_id, body.title ?? null, body.device_id).run()

  return c.json({ ok: true, id })
})

// posts in thread
app.get('/threads/:id/posts', async (c) => {
  const threadId = c.req.param('id')
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM posts WHERE thread_id = ? ORDER BY created_at ASC`
  ).bind(threadId).all()
  return c.json({ ok: true, posts: results })
})

// create post
app.post('/threads/:id/posts', async (c) => {
  const threadId = c.req.param('id')
  const body = await c.req.json<{
    image_base64: string
    duration: number
    device_id: string
    content?: string
  }>()

  if (!body.image_base64 || !body.device_id || typeof body.duration !== 'number') {
    return c.json({ ok: false, error: 'missing' }, 400)
  }

  const rate = await c.env.DB.prepare(
    `SELECT COUNT(*) as cnt FROM (
      SELECT 1 FROM threads WHERE device_id = ? AND created_at >= unixepoch('now','start of day')
      UNION ALL
      SELECT 1 FROM posts WHERE device_id = ? AND created_at >= unixepoch('now','start of day')
    )`
  ).bind(body.device_id, body.device_id).first<{ cnt: number }>()
  if ((rate?.cnt ?? 0) >= 4) return c.json({ ok: false, error: 'limit_reached' }, 429)

  const id = crypto.randomUUID()
  const key = `posts/${id}.png`
  const pngBuf = Uint8Array.from(atob(body.image_base64), (ch) => ch.charCodeAt(0))
  await c.env.BUCKET.put(key, pngBuf, { httpMetadata: { contentType: 'image/png' } })

  const audio_url = `${c.env.R2_PUBLIC_URL}/${key}`
  await c.env.DB.prepare(
    `INSERT INTO posts (id, thread_id, device_id, audio_url, duration, content) VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(id, threadId, body.device_id, audio_url, body.duration, body.content ?? null).run()

  return c.json({ ok: true, id, url: audio_url, remaining: 4 - ((rate?.cnt ?? 0) + 1) })
})

// delete post
app.delete('/posts/:id', async (c) => {
  const id = c.req.param('id')
  const device_id = c.req.query('device_id')
  if (!device_id) return c.json({ ok: false, error: 'missing device_id' }, 400)

  const post = await c.env.DB.prepare(`SELECT * FROM posts WHERE id = ?`).bind(id).first<{ device_id: string; audio_url: string }>()
  if (!post) return c.json({ ok: false, error: 'not_found' }, 404)
  if (post.device_id !== device_id) return c.json({ ok: false, error: 'forbidden' }, 403)

  await c.env.DB.prepare(`DELETE FROM posts WHERE id = ?`).bind(id).run()
  // Optionally delete from R2
  try {
    const key = post.audio_url.split('/').pop()
    if (key) await c.env.BUCKET.delete(`posts/${key}`)
  } catch {}

  return c.json({ ok: true })
})

// count
app.get('/count/:device_id', async (c) => {
  const device_id = c.req.param('device_id')
  const rate = await c.env.DB.prepare(
    `SELECT COUNT(*) as cnt FROM (
      SELECT 1 FROM threads WHERE device_id = ? AND created_at >= unixepoch('now','start of day')
      UNION ALL
      SELECT 1 FROM posts WHERE device_id = ? AND created_at >= unixepoch('now','start of day')
    )`
  ).bind(device_id, device_id).first<{ cnt: number }>()
  const count = rate?.cnt ?? 0
  return c.json({ ok: true, count, remaining: Math.max(0, 4 - count) })
})

export const onRequest = handle(app)
