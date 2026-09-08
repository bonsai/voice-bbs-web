export function encodeBytesAsPNG(bytes: Uint8Array): string {
  const payload = new Uint8Array(4 + bytes.length)
  new DataView(payload.buffer).setUint32(0, bytes.length, true)
  payload.set(bytes, 4)
  const width = Math.ceil(Math.sqrt(Math.max(1, payload.length / 3)))
  const height = Math.ceil(payload.length / 3 / width)
  const rgba = new Uint8Array(width * height * 4)
  rgba.fill(255)
  for (let i = 0; i < payload.length; i++) rgba[(i * 4)] = payload[i]
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const image = ctx.createImageData(width, height)
  for (let i = 0; i < rgba.length; i++) image.data[i] = rgba[i]
  ctx.putImageData(image, 0, 0)
  return canvas.toDataURL('image/png')
}

export async function blobToPngBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  return encodeBytesAsPNG(new Uint8Array(buffer))
}

export async function decodePNGToAudio(url: string): Promise<AudioBuffer> {
  const response = await fetch(url)
  const blob = await response.blob()
  const bitmap = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const packed = new Uint8Array(Math.ceil(data.length / 4))
  for (let i = 0; i < packed.length; i++) packed[i] = data[i * 4]
  const length = new DataView(packed.buffer).getUint32(0, true)
  const wav = packed.slice(4, 4 + length)
  return new AudioContext().decodeAudioData(wav.buffer.slice(0))
}
