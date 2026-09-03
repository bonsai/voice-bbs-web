// 録音 — 長押し。webm/opus → 無音トリム WAV → PNG base64
import { onBeforeUnmount, ref, type Ref } from 'vue'
import { webmToTrimmedWav } from '@/lib/audio'
import { bytesToPngBase64 } from '@/lib/pngCanvas'

export const RECORD_MAX_SEC = 30
export const MIN_VOICE_SEC = 0.3

export function useRecorder(
  canvasRef: Ref<HTMLCanvasElement | null>,
  onResult: (base64: string, duration: number) => Promise<void>,
) {
  const recording = ref(false)
  const elapsed = ref(0)
  const error = ref<string | null>(null)
  const canRecord = ref(true)

  let mediaRecorder: MediaRecorder | null = null
  let chunks: Blob[] = []
  let stream: MediaStream | null = null
  let timer: ReturnType<typeof setInterval> | null = null
  let analyser: AnalyserNode | null = null
  let audioCtx: AudioContext | null = null
  let raf = 0
  let maxVol = 0

  function drawWaveform() {
    const canvas = canvasRef.value
    if (!analyser || !canvas) return
    raf = requestAnimationFrame(drawWaveform)
    const arr = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(arr)
    maxVol = Math.max(maxVol, ...arr)
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    if (!w || !h) return
    canvas.width = w * devicePixelRatio
    canvas.height = h * devicePixelRatio
    const c = canvas.getContext('2d')!
    c.scale(devicePixelRatio, devicePixelRatio)
    c.clearRect(0, 0, w, h)
    const n = arr.length
    const bw = w / n
    for (let i = 0; i < n; i++) {
      const v = arr[i] / 255
      const bh = v * h * 0.9
      const x = i * bw
      c.fillStyle = `hsla(${260 - v * 120}, 80%, 65%, 0.8)`
      c.fillRect(x + 0.5, h / 2 - bh / 2, Math.max(bw - 1, 1), bh)
    }
  }

  async function start() {
    if (recording.value || !canRecord.value) return
    error.value = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      mediaRecorder = new MediaRecorder(stream, { mimeType: mime, audioBitsPerSecond: 32000 })
      chunks = []
      maxVol = 0
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }
      mediaRecorder.onstop = () => {
        stream?.getTracks().forEach((t) => t.stop())
        stream = null
        cleanup()
        if (chunks.length === 0) return
        if (maxVol < 5) {
          error.value = 'volume_low'
          return
        }
        void (async () => {
          try {
            const blob = new Blob(chunks, { type: 'audio/webm' })
            const { wavBytes, duration } = await webmToTrimmedWav(await blob.arrayBuffer())
            if (duration < MIN_VOICE_SEC) {
              error.value = 'too_short'
              return
            }
            const base64 = await bytesToPngBase64(wavBytes)
            await onResult(base64, duration)
          } catch (e) {
            console.error(e)
            error.value = 'encode_failed'
          }
        })()
      }

      audioCtx = new AudioContext()
      const src = audioCtx.createMediaStreamSource(stream)
      analyser = audioCtx.createAnalyser()
      analyser.fftSize = 128
      src.connect(analyser)
      drawWaveform()

      mediaRecorder.start()
      recording.value = true
      elapsed.value = 0
      const t0 = Date.now()
      timer = setInterval(() => {
        const e = Math.min((Date.now() - t0) / 1000, RECORD_MAX_SEC)
        elapsed.value = e
        if (e >= RECORD_MAX_SEC) stop()
      }, 100)
    } catch (e) {
      console.error(e)
      error.value = 'mic_denied'
    }
  }

  function stop() {
    if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop()
  }

  function cleanup() {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    if (timer) clearInterval(timer)
    timer = null
    audioCtx?.close()
    audioCtx = null
    analyser = null
    recording.value = false
  }

  onBeforeUnmount(() => {
    stop()
    stream?.getTracks().forEach((t) => t.stop())
    cleanup()
  })

  return {
    recording,
    elapsed,
    error,
    canRecord,
    start,
    stop,
  }
}
