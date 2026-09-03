// API クライアント — Next 実装 (src/lib/api.ts) の移植
// 本番は同一オリジン静的配信 + Hono Functions (/api)。dev は vite proxy → wrangler pages dev
const BASE = '/api'

export async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export const api = {
  healthz: () => fetchJSON<{ ok: boolean }>('/healthz'),
  categories: () => fetchJSON<{ ok: boolean; categories: Category[] }>('/categories'),
}

export interface Category {
  id: string
  name: string
  color: string
}
