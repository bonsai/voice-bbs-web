import { useEffect, useState } from 'react'
import { api, type Category, type Room, type Voice } from './api'
import { VoiceBubble } from './VoiceBubble'

export function App() {
  const [categories, setCategories] = useState<Category[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomId, setRoomId] = useState<string | null>(null)
  const [voices, setVoices] = useState<Voice[]>([])
  const [playing, setPlaying] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([api.healthz(), api.categories(), api.rooms()])
      .then(([, categoryResult, roomResult]) => {
        if (!active) return
        setCategories(categoryResult.categories)
        setRooms(roomResult.threads)
      })
      .catch((err) => active && setError(err instanceof Error ? err.message : String(err)))
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!roomId) return
    let active = true
    api.voices(roomId)
      .then((result) => active && setVoices(result.posts))
      .catch((err) => active && setError(err instanceof Error ? err.message : String(err)))
    return () => { active = false }
  }, [roomId])

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id
  const room = rooms.find((item) => item.id === roomId)

  if (roomId && room) {
    return (
      <main className="screen">
        <header className="header">
          <button className="back" onClick={() => setRoomId(null)} aria-label="ロビーへ">‹</button>
          <div>
            <div className="eyebrow">VOICE BBS / REACT</div>
            <h1>{room.title ?? '声の部屋'}</h1>
            <p>{categoryName(room.category_id)}・声 {voices.length}</p>
          </div>
        </header>
        <section className="room-space" aria-label="声の泡">
          {voices.length === 0 ? <p className="comparison-note">まだ声がありません。</p> : voices.map((voice) => (
            <VoiceBubble
              key={voice.id}
              label={`声を再生 ${Math.round(voice.duration)}秒`}
              state={playing === voice.id ? 'playing' : 'idle'}
              onClick={() => setPlaying((current) => current === voice.id ? null : voice.id)}
            />
          ))}
        </section>
        <section className="recorder" aria-label="録音">
          <div className="recorder-copy">
            <strong>長押しして話す</strong>
            <span>録音UIは共通仕様に合わせて実装予定</span>
          </div>
          <button className="record-button" disabled aria-label="録音">話す</button>
        </section>
        {error && <p className="comparison-note">APIエラー: {error}</p>}
      </main>
    )
  }

  return (
    <main className="screen">
      <header className="header lobby-header">
        <div>
          <div className="eyebrow">VOICE BBS / REACT</div>
          <h1>声の部屋</h1>
          <p>Hono APIを共有するReactフロントエンド。</p>
        </div>
      </header>
      <section className="rooms" aria-label="部屋一覧">
        {rooms.map((item) => (
          <button className="room-card" key={item.id} onClick={() => setRoomId(item.id)}>
            <span className="room-title">{item.title ?? '無題の部屋'}</span>
            <span>{categoryName(item.category_id)}・声 {item.post_count ?? 0}</span>
          </button>
        ))}
        {rooms.length === 0 && <p className="comparison-note">部屋を読み込み中…</p>}
      </section>
      <section className="comparison-note">
        <strong>Hono × React</strong>
        <span>カテゴリ、部屋、投稿を実APIから取得。FEはAPI境界を超えない。</span>
      </section>
      {error && <p className="comparison-note">APIエラー: {error}</p>}
    </main>
  )
}
