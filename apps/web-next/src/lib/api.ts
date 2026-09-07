const BASE = "/api";

export type Category = { id: string; name: string; color: string };
export type Thread = { id: string; category_id: string; title?: string | null; created_at: number; post_count?: number; latest_audio_url?: string | null };
export type Post = { id: string; thread_id: string; device_id: string; audio_url: string; duration: number; content?: string | null; created_at: number };

function getDeviceId() {
  let id = localStorage.getItem("voice_bbs_device_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("voice_bbs_device_id", id); }
  return id;
}

export async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status}: ${(body as { error?: string }).error || res.statusText}`);
  return body as T;
}

export const api = {
  deviceId: getDeviceId,
  healthz: () => fetchJSON<{ ok: boolean }>("/healthz"),
  categories: () => fetchJSON<{ ok: boolean; categories: Category[] }>("/categories"),
  threads: (params?: { category?: string; q?: string; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.category) sp.set("category", params.category);
    if (params?.q) sp.set("q", params.q);
    if (params?.limit) sp.set("limit", String(params.limit));
    const query = sp.toString();
    return fetchJSON<{ ok: boolean; threads: Thread[] }>(`/threads${query ? `?${query}` : ""}`);
  },
  createThread: (body: { category_id: string; title?: string }) => fetchJSON<{ ok: boolean; id: string }>("/threads", { method: "POST", body: JSON.stringify({ ...body, device_id: getDeviceId() }) }),
  posts: (threadId: string) => fetchJSON<{ ok: boolean; posts: Post[] }>(`/threads/${encodeURIComponent(threadId)}/posts`),
  createPost: (threadId: string, body: { image_base64: string; duration: number; content?: string }) => fetchJSON<{ ok: boolean; id: string; url: string; remaining: number }>(`/threads/${encodeURIComponent(threadId)}/posts`, { method: "POST", body: JSON.stringify({ ...body, device_id: getDeviceId() }) }),
  deletePost: (id: string) => fetchJSON<{ ok: boolean }>(`/posts/${encodeURIComponent(id)}?device_id=${encodeURIComponent(getDeviceId())}`, { method: "DELETE" }),
  count: (id = getDeviceId()) => fetchJSON<{ ok: boolean; count: number; remaining: number }>(`/count/${encodeURIComponent(id)}`),
};
