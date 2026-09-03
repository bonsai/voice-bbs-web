// 再生 — AudioContext は初回ユーザー操作で生成/復帰させる(モバイル自動再生対策)
const ctx = new AudioContext()

export async function ensureAudio(): Promise<AudioContext> {
  if (ctx.state === 'suspended') await ctx.resume()
  return ctx
}

/** url(同一オリジン /api/audio/*) → AudioBuffer キャッシュ付き */
export async function bufferForUrl(
  url: string,
  loader: (url: string) => Promise<Uint8Array>,
): Promise<AudioBuffer> {
  const bytes = await loader(url)
  const audioCtx = await ensureAudio()
  const copy = bytes.slice()
  return audioCtx.decodeAudioData(copy.buffer as ArrayBuffer)
}
