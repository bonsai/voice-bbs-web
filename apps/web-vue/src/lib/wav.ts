// WAV 生成/解析 — 純関数(node でテスト可能)
// Next 実装 audioBufferToWav の同一仕様を AudioBuffer 非依存で再現

const HEADER_SIZE = 44

/** PCM(float mono) → WAV 16bit バイト列。Next 実装と同一ヘッダ・変換式 */
export function pcmToWav(
  samples: Float32Array,
  sampleRate: number,
  numChannels = 1,
): Uint8Array {
  const bitsPerSample = 16
  const blockAlign = (numChannels * bitsPerSample) / 8
  const byteRate = sampleRate * blockAlign
  const dataSize = samples.length * blockAlign
  const totalSize = HEADER_SIZE + dataSize

  const wav = new ArrayBuffer(totalSize)
  const view = new DataView(wav)

  function writeString(offset: number, s: string) {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i))
  }

  writeString(0, 'RIFF')
  view.setUint32(4, totalSize - 8, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  writeString(36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = HEADER_SIZE
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]))
    const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff
    view.setInt16(offset, int16, true)
    offset += 2
  }
  return new Uint8Array(wav)
}

/** WAV バイト列から 16bit PCM サンプルを復元(ヘッダは検証のみ) */
export function wavToPcm(wav: Uint8Array): { samples: Float32Array; sampleRate: number } {
  const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength)
  if (wav[0] !== 0x52 || wav[1] !== 0x49 || wav[2] !== 0x46 || wav[3] !== 0x46) {
    throw new Error('not RIFF')
  }
  const sampleRate = view.getUint32(24, true)
  const dataSize = view.getUint32(40, true)
  const samples = new Float32Array(dataSize / 2)
  for (let i = 0; i < samples.length; i++) {
    const int16 = view.getInt16(44 + i * 2, true)
    samples[i] = int16 / (int16 < 0 ? 0x8000 : 0x7fff)
  }
  return { samples, sampleRate }
}
