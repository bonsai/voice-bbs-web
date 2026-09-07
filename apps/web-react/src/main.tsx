import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

type Voice = {
  id: string
  audio_url: string
  duration: number
  device_id: string
}

const deviceId = () => {
  const key = 'voice_bbs_device_id'
  let value = localStorage.getItem(key)
  if (!value) {
    value = crypto.randomUUID()
    localStorage.setItem(key, value)
  }
  return value
}

const hash = (value: string) =>
  [...value].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0)

function VoiceBubble({
  voice,
  mine,
  playing,
  onPlay,
  onLongPress,
}: {
  voice: Voice
  mine: boolean
  playing: boolean
  onPlay: () => void
  onLongPress: () => void
}) {
  const timer = useRef<number | null>(null)
  const suppress = useRef(false)
  const h = hash(voice.id)
  const size = 64 + Math.min(70, Math.max(0, voice.duration * 8))
  const style = {
    width: size,
    height: size,
    left: `${10 + (h % 80)}%`,
    top: `${8 + (Math.floor(h / 97) % 74)}%`,
    animationDelay: `-${(h >> 3) % 10}s`,
  } as React.CSSProperties

  const down = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    timer.current = window.setTimeout(() => {
      suppress.current = true
      navigator.vibrate?.(20)
      onLongPress()
    }, 300)
  }

  const up = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
    }
    timer.current = null
  }

  const click = () => {
    if (suppress.current) {
      suppress.current = false
      return
    }
    onPlay()
  }

  const label = `${voice.duration.toFixed(1)}秒の声`
  const durationLabel = playing ? '♪' : `${voice.duration.toFixed(1)}s`

  return (
    <button
      className={`voice-bubble ${playing ? 'playing' : ''}`}
      style={style}
      aria-label={label}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onPointerCancel={up}
      onClick={click}
    >
      <span className="wave" />
      <span className="duration">{durationLabel}</span>
      {mine && <span className="mine">自</span>}
    </button>
  )
}

function Recorder({
  onRecorded,
}: {
  onRecorded: (blob: Blob, duration: number) => void
}) {
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const chunks = useRef<Blob[]>([])
  const started = useRef(0)
  const timer = useRef<number | null>(null)
  const stopTimer = useRef<number | null>(null)

  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearInterval(timer.current)
    }
    timer.current = null
    if (stopTimer.current !== null) {
      window.clearTimeout(stopTimer.current)
    }
    stopTimer.current = null
  }

  const stop = () => {
    clearTimer()
    if (recorder.current?.state === 'recording') {
      recorder.current.stop()
    }
  }

  const start = async (event: React.PointerEvent<HTMLDivElement>) => {
    if (recording) return
    event.currentTarget.setPointerCapture(event.pointerId)

    try {
      if (!navigator.mediaDevices?.getUserMedia || !('MediaRecorder' in window)) {
        throw new Error('recording-unsupported')
      }

      const input = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(input)
      stream.current = input
      recorder.current = mediaRecorder
      chunks.current = []
      started.current = Date.now()

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size) {
          chunks.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const duration = Math.min(30, (Date.now() - started.current) / 1000)
        const blob = new Blob(chunks.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        })

        input.getTracks().forEach((track) => track.stop())
        stream.current = null
        recorder.current = null
        chunks.current = []
        setRecording(false)
        setElapsed(0)

        if (blob.size > 0 && duration > 0.05) {
          onRecorded(blob, duration)
        }
      }

      mediaRecorder.start()
      setRecording(true)
      timer.current = window.setInterval(() => {
        setElapsed((Date.now() - started.current) / 1000)
      }, 100)
      stopTimer.current = window.setTimeout(stop, 30000)
    } catch {
      stream.current?.getTracks().forEach((track) => track.stop())
      stream.current = null
      setRecording(false)
      alert('マイクを許可してください')
    }
  }

  useEffect(() => {
    return () => {
      clearTimer()
      stream.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const label = recording
    ? `吹き込み中… ${Math.ceil(elapsed)}s / 30s`
    : '長押しで吹き込む'

  return (
    <div
      className={`recorder ${recording ? 'recording' : ''}`}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerCancel={stop}
      onPointerLeave={stop}
    >
      {label}
    </div>
  )
}

function App() {
  const [voices, setVoices] = useState<Voice[]>([])
  const [playing, setPlaying] = useState<string | null>(null)
  const [status, setStatus] = useState('React PoC')
  const myId = useMemo(deviceId, [])
  const audio = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetch('/api/threads?limit=1').catch(() => {})
    return () => audio.current?.pause()
  }, [])

  const addRecorded = (blob: Blob, duration: number) => {
    const id = crypto.randomUUID()
    const url = URL.createObjectURL(blob)
    setVoices((current) => [
      ...current,
      { id, audio_url: url, duration, device_id: myId },
    ])
    setStatus('録音済みの声を泡として追加')
  }

  const play = (voice: Voice) => {
    if (!voice.audio_url) return
    audio.current?.pause()
    const player = new Audio(voice.audio_url)
    audio.current = player
    setPlaying(voice.id)
    player.onended = () => setPlaying(null)
    player.onerror = () => setPlaying(null)
    void player.play()
  }

  return (
    <main>
      <header>
        <button aria-label="ロビーへ">‹</button>
        <div>
          <strong>Voice BBS</strong>
          <small>{status}</small>
        </div>
        <span className="badge">React + Vite PoC</span>
      </header>

      <section className="room" aria-label="Voice bubbles">
        {voices.length === 0 && (
          <p className="empty">長押しで声を録音すると、泡になります</p>
        )}
        {voices.map((voice) => (
          <VoiceBubble
            key={voice.id}
            voice={voice}
            mine={voice.device_id === myId}
            playing={playing === voice.id}
            onPlay={() => play(voice)}
            onLongPress={() => setStatus('自分の声: 削除アクション')}
          />
        ))}
      </section>

      <footer>
        <Recorder onRecorded={addRecorded} />
        <p>最大30秒。録音データはこのPoCのブラウザ内だけで再生します。</p>
      </footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
