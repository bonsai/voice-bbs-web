import { blobToPngBase64, decodePNGToAudio } from './audioCodec'

type Category = { id: string; name: string; color: string }
type Thread = { id: string; category_id: string; title?: string | null; created_at: number; post_count?: number }
type Post = { id: string; thread_id: string; device_id: string; audio_url: string; duration: number; created_at: number }
type Count = { count: number; remaining: number; limit: number }

const API = '/api'
const app = document.querySelector<HTMLDivElement>('#app')!
const deviceId = getDeviceId()
let categories: Category[] = []
let threads: Thread[] = []
let selected: Thread | null = null
let posts: Post[] = []
let count: Count | null = null
let recorder: MediaRecorder | null = null
let chunks: Blob[] = []
let startedAt = 0
let playing: AudioBufferSourceNode | null = null

function getDeviceId() {
  const key = 'voice_bbs_device_id'
  const current = localStorage.getItem(key)
  if (current) return current
  const id = crypto.randomUUID()
  localStorage.setItem(key, id)
  return id
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

async function send<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  return res.json() as Promise<T>
}

async function remove(path: string) {
  const res = await fetch(`${API}${path}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
}

function esc(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

async function loadCount() { count = await get<Count>(`/count/${encodeURIComponent(deviceId)}`) }

async function openThread(thread: Thread) {
  selected = thread
  posts = (await get<{ posts: Post[] }>(`/threads/${encodeURIComponent(thread.id)}/posts`)).posts
  await loadCount()
  render()
}

async function playPost(post: Post) {
  playing?.stop()
  const buffer = await decodePNGToAudio(post.audio_url)
  const ctx = new AudioContext()
  playing = ctx.createBufferSource()
  playing.buffer = buffer
  playing.connect(ctx.destination)
  playing.start()
  playing.onended = () => { playing = null }
}

async function toggleRecording() {
  if (recorder?.state === 'recording') {
    recorder.stop()
    return
  }
  if (!selected) return
  if ((count?.remaining ?? 0) <= 0) return
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  chunks = []
  recorder = new MediaRecorder(stream)
  startedAt = performance.now()
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
  recorder.onstop = async () => {
    stream.getTracks().forEach((t) => t.stop())
    const duration = Math.min(30, Math.round((performance.now() - startedAt) / 1000 * 10) / 10)
    if (duration < 0.5) { render(); return }
    try {
      const base64 = await blobToPngBase64(new Blob(chunks, { type: recorder?.mimeType || 'audio/webm' }))
      await send(`/threads/${encodeURIComponent(selected!.id)}/posts`, { image_base64: base64, device_id: deviceId, duration })
      await openThread(selected!)
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error))
      render()
    }
  }
  recorder.start()
  render()
}

async function deletePost(post: Post) {
  try {
    await remove(`/posts/${encodeURIComponent(post.id)}?device_id=${encodeURIComponent(deviceId)}`)
    if (selected) await openThread(selected)
  } catch (error) { alert(error instanceof Error ? error.message : String(error)) }
}

async function render() {
  app.innerHTML = '<main><h1>Voice BBS</h1><p>Honoへ接続中…</p></main>'
  try {
    if (!categories.length) categories = (await get<{ categories: Category[] }>('/categories')).categories
    if (!threads.length) threads = (await get<{ threads: Thread[] }>('/threads?limit=50')).threads
    await loadCount()
    const categoryMap = new Map(categories.map((c) => [c.id, c]))
    if (!selected) {
      app.innerHTML = `<main><header><h1>Voice BBS</h1><p>4th FE / framework-neutral · Hono ●</p></header><section id="categories">${categories.map((c) => `<button data-category="${esc(c.id)}">${esc(c.name)}</button>`).join('')}</section><section id="threads">${threads.map((t) => `<article><button data-thread="${esc(t.id)}"><strong>${esc(t.title || '無題のスレッド')}</strong><small>${esc(categoryMap.get(t.category_id)?.name || '')} · ${t.post_count || 0} 声</small></button></article>`).join('') || '<p>まだスレッドがありません。</p>'}</section><p>残り投稿: ${count?.remaining ?? '—'} / ${count?.limit ?? 4}</p></main>`
      document.querySelectorAll<HTMLElement>('[data-thread]').forEach((el) => el.onclick = () => openThread(threads.find((t) => t.id === el.dataset.thread)!))
      return
    }
    app.innerHTML = `<main><header><button id="back">← 戻る</button><h1>${esc(selected.title || '無題のスレッド')}</h1><p>残り投稿: ${count?.remaining ?? '—'} / ${count?.limit ?? 4}</p></header><section id="posts">${posts.map((p) => `<article><button data-play="${esc(p.id)}">▶ ${p.duration}s</button>${p.device_id === deviceId ? `<button data-delete="${esc(p.id)}">削除</button>` : ''}</article>`).join('') || '<p>まだ声がありません。</p>'}</section><button id="record" ${((count?.remaining ?? 0) <= 0 || recorder?.state === 'recording') ? '' : ''}>${recorder?.state === 'recording' ? '■ 録音停止' : '● 録音して投稿'}</button></main>`
    document.querySelector('#back')!.addEventListener('click', () => { selected = null; posts = []; void render() })
    document.querySelector('#record')!.addEventListener('click', () => void toggleRecording())
    document.querySelectorAll<HTMLElement>('[data-play]').forEach((el) => el.onclick = () => playPost(posts.find((p) => p.id === el.dataset.play)!))
    document.querySelectorAll<HTMLElement>('[data-delete]').forEach((el) => el.onclick = () => void deletePost(posts.find((p) => p.id === el.dataset.delete)!))
  } catch (error) {
    app.innerHTML = `<main><h1>Voice BBS</h1><p role="alert">APIエラー: ${esc(error instanceof Error ? error.message : String(error))}</p></main>`
  }
}

void render()
