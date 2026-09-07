type Category = { id: string; name: string; color: string }
type Thread = { id: string; category_id: string; title?: string | null; created_at: number; post_count?: number }

const API = '/api'
const app = document.querySelector<HTMLDivElement>('#app')!

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

async function render() {
  app.innerHTML = '<main><h1>Voice BBS</h1><p>Honoへ接続中…</p></main>'
  try {
    const [categories, threads] = await Promise.all([
      get<{ categories: Category[] }>('/categories'),
      get<{ threads: Thread[] }>('/threads?limit=50'),
    ])
    const categoryMap = new Map(categories.categories.map((c) => [c.id, c]))
    app.innerHTML = `
      <main>
        <header><h1>Voice BBS</h1><p>4th FE / framework-neutral</p></header>
        <section id="categories"></section>
        <section id="threads"></section>
      </main>`
    const catEl = document.querySelector('#categories')!
    catEl.innerHTML = categories.categories.map((c) => `<button data-category="${c.id}">${c.name}</button>`).join('')
    const threadEl = document.querySelector('#threads')!
    threadEl.innerHTML = threads.threads.map((t) => {
      const c = categoryMap.get(t.category_id)
      return `<article><button data-thread="${t.id}"><strong>${t.title || '無題のスレッド'}</strong><small>${c?.name || ''} · ${t.post_count || 0} 声</small></button></article>`
    }).join('') || '<p>まだスレッドがありません。</p>'
  } catch (error) {
    app.innerHTML = `<main><h1>Voice BBS</h1><p role="alert">APIエラー: ${error instanceof Error ? error.message : String(error)}</p></main>`
  }
}

void render()
