// ブラウザ依存の canvas/PNG 変換 — 配置ロジックは純関数(pngbytes)に委譲
import { computeCanvasSize, packBytesToRgba, unpackRgbaToBytes } from './pngbytes'

/** バイト列 → PNG(base64, dataURL prefix なし)。録音アップロード用 */
export async function bytesToPngBase64(bytes: Uint8Array): Promise<string> {
  const { width, height } = computeCanvasSize(bytes.length)
  const rgba = packBytesToRgba(bytes, width, height)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba), width, height), 0, 0)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('toBlob failed'))
      const reader = new FileReader()
      reader.onloadend = () => resolve(String(reader.result).split(',')[1])
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    }, 'image/png')
  })
}

/** 同一オリジンの PNG URL を取得して元バイト列に復元する */
export async function fetchPngBytes(url: string): Promise<Uint8Array> {
  const blob = await (await fetch(url)).blob()
  const bitmap = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(bitmap, 0, 0)
  const img = ctx.getImageData(0, 0, bitmap.width, bitmap.height)
  return unpackRgbaToBytes(img.data)
}
