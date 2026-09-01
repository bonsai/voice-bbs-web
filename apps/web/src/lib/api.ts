const BASE = process.env.NODE_ENV === "development" ? "/api" : "/api";

function getDeviceId() {
  let id = localStorage.getItem("voice_bbs_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("voice_bbs_device_id", id);
  }
  return id;
}

export async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  deviceId: getDeviceId,
  healthz: () => fetchJSON<{ ok: boolean }>("/healthz"),
  categories: () => fetchJSON<{ ok: boolean; categories: any[] }>("/categories"),
  threads: (params?: { category?: string; q?: string; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.category) sp.set("category", params.category);
    if (params?.q) sp.set("q", params.q);
    if (params?.limit) sp.set("limit", String(params.limit));
    return fetchJSON<{ ok: boolean; threads: any[] }>(`/threads?${sp.toString()}`);
  },
  createThread: (body: { category_id: string; title?: string }) =>
    fetchJSON<{ ok: boolean; id: string }>("/threads", {
      method: "POST",
      body: JSON.stringify({ ...body, device_id: getDeviceId() }),
    }),
  posts: (threadId: string) =>
    fetchJSON<{ ok: boolean; posts: any[] }>(`/threads/${threadId}/posts`),
  createPost: (threadId: string, body: { image_base64: string; duration: number; content?: string }) =>
    fetchJSON<{ ok: boolean; id: string; url: string; remaining: number }>(`/threads/${threadId}/posts`, {
      method: "POST",
      body: JSON.stringify({ ...body, device_id: getDeviceId() }),
    }),
  deletePost: (id: string) =>
    fetchJSON<{ ok: boolean }>(`/posts/${id}?device_id=${getDeviceId()}`, { method: "DELETE" }),
  count: (deviceId: string) =>
    fetchJSON<{ ok: boolean; count: number; remaining: number }>(`/count/${deviceId}`),
};
