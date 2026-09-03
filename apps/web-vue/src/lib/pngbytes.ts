// バイト列 ⇔ RGBA ピクセル配置 — 純関数(node でテスト可能)
// Next 実装 encodeBytesAsPNG / decodePNGToWav の「配置レイアウト」を canvas 非依存で再現
// レイアウト: 先頭 4 バイト(BE データ長) + データ本体を RGB に埋め込み(Alpha は常に 255)

export interface CanvasSize {
  width: number
  height: number
}

/** データ長から canvas 寸法を決める(Next 実装と同じ式) */
export function computeCanvasSize(dataLength: number): CanvasSize {
  const numPixels = Math.ceil((4 + dataLength) / 3)
  const width = Math.ceil(Math.sqrt(numPixels))
  const height = Math.ceil(numPixels / width)
  return { width, height }
}

/** WAV バイト列 → RGBA(ImageData 相当)。canvas へ putImageData する想定 */
export function packBytesToRgba(bytes: Uint8Array, width: number, height: number): Uint8ClampedArray {
  const totalBytes = 4 + bytes.length
  const all = new Uint8Array(totalBytes)
  const lenView = new DataView(all.buffer)
  lenView.setUint32(0, bytes.length, false) // BE 長
  all.set(bytes, 4)

  const img = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    const byteIdx = i * 3
    const px = i * 4
    img[px] = byteIdx < totalBytes ? all[byteIdx] : 0
    img[px + 1] = byteIdx + 1 < totalBytes ? all[byteIdx + 1] : 0
    img[px + 2] = byteIdx + 2 < totalBytes ? all[byteIdx + 2] : 0
    img[px + 3] = 255
  }
  return img
}

/** RGBA(ImageData) → 元バイト列。
 * RGBA ストリームは「3バイト+alpha」なので、alpha を除いたバイト列として読む。
 * 先頭から4バイト(BE)をデータ長とし、続く len バイトを復元する。
 * ※ Next 実装は getUint32 を RGBA 先頭にかけて alpha を長さに混入させるバグがあった(修正版) */
export function unpackRgbaToBytes(rgba: Uint8ClampedArray): Uint8Array {
  // バイト位置 p は rgba 上の p + floor(p/3) に置かれる(3 バイトごとに alpha 挿入)
  const at = (p: number) => rgba[p + Math.floor(p / 3)]
  const readU32BE = (): number =>
    ((at(0) << 24) | (at(1) << 16) | (at(2) << 8) | at(3)) >>> 0
  const len = readU32BE()
  const out = new Uint8Array(len)
  for (let k = 0; k < len; k++) out[k] = at(4 + k)
  return out
}
