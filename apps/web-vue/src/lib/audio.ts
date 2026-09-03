// 音声デコード — ブラウザ AudioContext 依存部分
import { pcmToWav } from './wav'
import { trimSilence } from './silence'

export interface DecodedVoice {
  wavBytes: Uint8Array
  duration: number
}

/** WAV バイト列 → AudioBuffer(decodeAudioData) */
export async function decodeWavBytes(
  ctx: AudioContext,
  wavBytes: Uint8Array,
): Promise<AudioBuffer> {
  const copy = wavBytes.slice() // ArrayBuffer に複製(型安全のため)
  return ctx.decodeAudioData(copy.buffer as ArrayBuffer)
}

/** webm/opus 録音 → 無音トリム済み WAV(mono float → 16bit)。sampleRate はデコード結果から採る */
export async function webmToTrimmedWav(
  arrayBuffer: ArrayBuffer,
): Promise<{ wavBytes: Uint8Array; duration: number }> {
  const ctx = new AudioContext()
  try {
    const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0))
    const sampleRate = buffer.sampleRate
    const samples = buffer.getChannelData(0)
    const trimmed = trimSilence(samples, { sampleRate })
    const wavBytes = pcmToWav(trimmed, sampleRate)
    return { wavBytes, duration: trimmed.length / sampleRate }
  } finally {
    await ctx.close()
  }
}
