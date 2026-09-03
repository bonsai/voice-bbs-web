// 部屋名を「声で入力」する音声認識(SpeechRecognition)。未対応時はテキスト入力にフォールバック
import { onBeforeUnmount, ref } from 'vue'

interface SR extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: { resultIndex: number; results: { length: number; [i: number]: { isFinal: boolean; [j: number]: { transcript: string } } } }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}

function getSR(): SR | null {
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR }
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
  return Ctor ? new Ctor() : null
}

export function useSpeechName() {
  const supported = ref(getSR() !== null)
  const listening = ref(false)
  const interim = ref('')

  let rec: SR | null = null

  function start(onFinal: (text: string) => void) {
    const sr = getSR()
    if (!sr) return
    rec = sr
    sr.lang = 'ja-JP'
    sr.continuous = false
    sr.interimResults = true
    sr.maxAlternatives = 1
    sr.onresult = (e) => {
      let t = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        t += e.results[i][0].transcript
        if (e.results[i].isFinal) {
          onFinal(t.trim())
          stop()
          return
        }
      }
      interim.value = t
    }
    sr.onerror = () => {
      listening.value = false
    }
    sr.onend = () => {
      listening.value = false
    }
    sr.start()
    listening.value = true
  }

  function stop() {
    try {
      rec?.stop()
    } catch {
      /* noop */
    }
    rec = null
    listening.value = false
    interim.value = ''
  }

  onBeforeUnmount(stop)
  return { supported, listening, interim, start, stop }
}
