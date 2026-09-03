// API クライアント — Next 実装 (src/lib/api.ts) の移植 + room 語彙
// API 境界は不変(Hono Functions)。本番は同一オリジン、dev は vite proxy

export const BASE = '/api'

export interface Category {
  id: string
  name: string
  color: string
}

export interface Room {
  id: string
  category_id: string
  title?: string | null
  device_id: string
  created_at: number
  total_duration?: number
  post_count?: number
  latest_audio_url?: string | null
}

export interface Voice {
  id: string
  thread_id: string
  device_id: string
  audio_url: string
  duration: number
  content?: string | null
  created_at: number
}

export interface StorageLike {
  getItem(k: string): string | null
  setItem(k: string, v: string): void
}

export function getDeviceId(storage: StorageLike): string {
  let id = storage.getItem('voice_bbs_device_id')
  if (!id) {
    id = crypto.randomUUID()
    storage.setItem('voice_bbs_device_id', id)
  }
  return id
}

export async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...(init?.headers || {}), 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    let detail = ''
    try {
      const body = (await res.json()) as { error?: string }
      detail = body.error ? `: ${body.error}` : ''
    } catch {
      /* noop */
    }
    throw new Error(`${res.status} ${res.statusText}${detail}`)
  }
  return res.json() as Promise<T>
}

export function createApi(storage: StorageLike) {
  const did = () => getDeviceId(storage)
  return {
    healthz: () => fetchJSON<{ ok: boolean }>('/healthz'),
    categories: () => fetchJSON<{ ok: boolean; categories: Category[] }>('/categories'),
    rooms: (params?: { category?: string; q?: string; limit?: number }) => {
      const sp = new URLSearchParams()
      if (params?.category) sp.set('category', params.category)
      if (params?.q) sp.set('q', params.q)
      if (params?.limit) sp.set('limit', String(params.limit))
      return fetchJSON<{ ok: boolean; threads: Room[] }>(`/threads?${sp.toString()}`)
    },
    createRoom: (body: { category_id: string; title?: string }) =>
      fetchJSON<{ ok: boolean; id: string }>('/threads', {
        method: 'POST',
        body: JSON.stringify({ ...body, device_id: did() }),
      }),
    voices: (roomId: string) =>
      fetchJSON<{ ok: boolean; posts: Voice[] }>(`/threads/${roomId}/posts`),
    createVoice: (roomId: string, body: { image_base64: string; duration: number; content?: string }) =>
      fetchJSON<{ ok: boolean; id: string; url: string; remaining: number }>(
        `/threads/${roomId}/posts`,
        { method: 'POST', body: JSON.stringify({ ...body, device_id: did() }) },
      ),
    deleteVoice: (id: string) =>
      fetchJSON<{ ok: boolean }>(`/posts/${id}?device_id=${did()}`, { method: 'DELETE' }),
    count: () =>
      fetchJSON<{ ok: boolean; count: number; remaining: number }>(`/count/${did()}`),
  }
}
