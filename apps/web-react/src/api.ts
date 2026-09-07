export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

export type Category = { id: string; name: string; color: string }
export type Room = {
  id: string
  category_id: string
  title?: string | null
  created_at: number
  post_count?: number
  latest_audio_url?: string | null
}
export type Voice = {
  id: string
  thread_id: string
  device_id: string
  audio_url: string
  duration: number
  content?: string | null
  created_at: number
}

type Json = Record<string, unknown>

async function request<T extends Json>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  const body = (await response.json().catch(() => ({}))) as T & { error?: string }
  if (!response.ok) throw new Error(`${response.status}: ${body.error ?? response.statusText}`)
  return body
}

export function deviceId() {
  const key = 'voice_bbs_device_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export const api = {
  categories: () => request<{ ok: boolean; categories: Category[] }>('/categories'),
  rooms: (category?: string) => request<{ ok: boolean; threads: Room[] }>(`/threads${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  voices: (roomId: string) => request<{ ok: boolean; posts: Voice[] }>(`/threads/${encodeURIComponent(roomId)}/posts`),
  count: () => request<{ ok: boolean; count: number; remaining: number }>(`/count/${deviceId()}`),
}
