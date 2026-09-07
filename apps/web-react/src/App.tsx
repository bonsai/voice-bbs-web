import { useState } from 'react'
import { VoiceBubble } from './VoiceBubble'

const rooms = [
  { id: 'demo', title: 'テスト雑談部屋', category: '雑談', count: 3 },
  { id: 'idea', title: 'アイデア部屋', category: 'アイデア', count: 1 },
]

export function App() {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)

  if (roomId) {
    const room = rooms.find((item) => item.id === roomId) ?? rooms[0]
    return (
      <main className="screen">
        <header className="header">
          <button className="back" onClick={() => setRoomId(null)} aria-label="ロビーへ">‹</button>
          <div>
            <div className="eyebrow">VOICE BBS / REACT POC</div>
            <h1>{room.title}</h1>
            <p>{room.category}・声 {room.count}</p>
          </div>
        </header>

        <section className="room-space" aria-label="声の泡">
          <VoiceBubble
            label="テストの声を再生"
            state={playing === 'demo-1' ? 'playing' : 'idle'}
            onClick={() => setPlaying((current) => current === 'demo-1' ? null : 'demo-1')}
          />
          <VoiceBubble
            label="別の声を再生"
            state={playing === 'demo-2' ? 'playing' : 'idle'}
            onClick={() => setPlaying((current) => current === 'demo-2' ? null : 'demo-2')}
          />
        </section>

        <section className="recorder" aria-label="録音">
          <div className="recorder-copy">
            <strong>{recording ? '録音中。離すと投稿' : '長押しして話す'}</strong>
            <span>React pointer events の最小比較</span>
          </div>
          <button
            className={recording ? 'record-button recording' : 'record-button'}
            aria-label={recording ? '録音を停止して投稿' : '録音を開始'}
            onPointerDown={() => setRecording(true)}
            onPointerUp={() => setRecording(false)}
            onPointerCancel={() => setRecording(false)}
            onPointerLeave={() => setRecording(false)}
          >
            {recording ? '●' : '話す'}
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="screen">
      <header className="header lobby-header">
        <div>
          <div className="eyebrow">VOICE BBS / REACT POC</div>
          <h1>声の部屋</h1>
          <p>React + Viteで同じ体験を最小再実装。</p>
        </div>
      </header>

      <section className="rooms" aria-label="部屋一覧">
        {rooms.map((room) => (
          <button className="room-card" key={room.id} onClick={() => setRoomId(room.id)}>
            <span className="room-title">{room.title}</span>
            <span>{room.category}・声 {room.count}</span>
          </button>
        ))}
      </section>

      <section className="comparison-note">
        <strong>PoCの目的</strong>
        <span>Lobby / RoomView / VoiceBubble / pointer録音導線を同条件で比較する。</span>
      </section>
    </main>
  )
}
