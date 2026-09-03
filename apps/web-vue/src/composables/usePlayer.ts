// 泡タップ再生 — 「触ると喋る」。割り込み再生・同泡トグル停止
import { ref } from 'vue'
import { bufferForUrl, ensureAudio } from '@/lib/player'
import { fetchPngBytes } from '@/lib/pngCanvas'

const cache = new Map<string, Promise<AudioBuffer>>()

function voiceBuffer(url: string): Promise<AudioBuffer> {
  let p = cache.get(url)
  if (!p) {
    p = bufferForUrl(url, fetchPngBytes)
    cache.set(url, p)
    p.catch(() => cache.delete(url))
  }
  return p
}

export function usePlayer() {
  const playingId = ref<string | null>(null)
  const busyId = ref<string | null>(null)
  let src: AudioBufferSourceNode | null = null

  async function play(url: string, id: string) {
    busyId.value = id
    try {
      const ctx = await ensureAudio()
      const buffer = await voiceBuffer(url)
      if (playingId.value === id) {
        // 再生中にもう一度触れた = 停止
        src?.stop()
        src = null
        playingId.value = null
        return
      }
      stop()
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)
      source.onended = () => {
        if (playingId.value === id) {
          playingId.value = null
          src = null
        }
      }
      src = source
      playingId.value = id
      source.start()
    } catch (e) {
      console.error(e)
    } finally {
      busyId.value = null
    }
  }

  function stop() {
    src?.stop()
    src = null
    playingId.value = null
  }

  return { playingId, busyId, play, stop }
}
