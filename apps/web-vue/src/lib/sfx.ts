// 短音エフェクト — 泡タップ時の「pop」音
// AudioContextはユーザー操作後に初期化 (ブラウザ自動再生ポリシー対応)

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx || ctx.state === 'closed') {
    ctx = new AudioContext()
  }
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }
  return ctx
}

export function playPop(volume = 0.25, freq = 800) {
  const audioCtx = getCtx()
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + 0.08)
  gain.gain.setValueAtTime(volume, audioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1)
  osc.connect(gain).connect(audioCtx.destination)
  osc.start()
  osc.stop(audioCtx.currentTime + 0.12)
}