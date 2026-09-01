const MAX_DURATION = 30;

export function bubbleSizePx(duration: number) {
  const scale = Math.min(duration / MAX_DURATION, 1);
  return Math.round(56 + scale * 104);
}

export function encodeBytesAsPNG(bytes: Uint8Array): Promise<string> {
  const dataLength = bytes.length;
  const totalBytes = 4 + dataLength;
  const numPixels = Math.ceil(totalBytes / 3);
  const width = Math.ceil(Math.sqrt(numPixels));
  const height = Math.ceil(numPixels / width);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const imageData = ctx.createImageData(width, height);

  const lenBytes = new Uint8Array(4);
  new DataView(lenBytes.buffer).setUint32(0, dataLength, false);

  const allBytes = new Uint8Array(totalBytes);
  allBytes.set(lenBytes, 0);
  allBytes.set(bytes, 4);

  for (let i = 0; i < numPixels; i++) {
    const byteIdx = i * 3;
    const pixelIdx = i * 4;
    imageData.data[pixelIdx] = allBytes[byteIdx] || 0;
    imageData.data[pixelIdx + 1] = allBytes[byteIdx + 1] || 0;
    imageData.data[pixelIdx + 2] = allBytes[byteIdx + 2] || 0;
    imageData.data[pixelIdx + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      if (blob) reader.readAsDataURL(blob);
    }, 'image/png');
  });
}

export async function decodePNGToWav(url: string): Promise<{ wavBytes: Uint8Array; duration: number; audioBuffer: AudioBuffer }> {
  const res = await fetch(url);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0);
  const imgData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);

  const len = new DataView(imgData.data.buffer, imgData.data.byteOffset).getUint32(0, false);
  const wavBytes = new Uint8Array(len);
  const all = imgData.data;
  let di = 0;
  let si = 4; // skip first 4 bytes (length header)
  while (di < len && si < all.length) {
    // read R, G, B (skip A because A was always 255)
    wavBytes[di++] = all[si++];
    if (di < len) wavBytes[di++] = all[si++];
    if (di < len) wavBytes[di++] = all[si++];
    si++; // skip alpha
  }

  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(wavBytes.buffer.slice(wavBytes.byteOffset, wavBytes.byteOffset + len));
  audioCtx.close();
  return { wavBytes, duration: audioBuffer.duration, audioBuffer };
}

export function audioBufferToWav(buffer: AudioBuffer): Uint8Array {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitsPerSample = 16;
  const data = buffer.getChannelData(0);
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = data.length * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const wav = new ArrayBuffer(totalSize);
  const view = new DataView(wav);

  function writeString(offset: number, s: string) {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  }

  writeString(0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < data.length; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]));
    const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  return new Uint8Array(wav);
}

export async function trimWebmToWav(arrayBuffer: ArrayBuffer): Promise<{ wavBytes: Uint8Array; duration: number }> {
  const audioCtx = new AudioContext();
  let buffer: AudioBuffer;
  try {
    buffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    await audioCtx.close();
  }

  const samples = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  const windowSize = Math.floor(sampleRate * 0.02);
  const silenceThreshold = 0.003;

  let rmsWindow = 0;
  for (let i = 0; i < Math.min(windowSize, samples.length); i++) rmsWindow += samples[i] * samples[i];

  let startSample = 0;
  for (let i = 0; i < samples.length - windowSize; i++) {
    const rms = Math.sqrt(rmsWindow / windowSize);
    if (rms > silenceThreshold) {
      startSample = Math.max(0, i - Math.floor(sampleRate * 0.05));
      break;
    }
    rmsWindow -= samples[i] * samples[i];
    rmsWindow += samples[i + windowSize] * samples[i + windowSize];
  }

  rmsWindow = 0;
  for (let i = Math.max(0, samples.length - windowSize); i < samples.length; i++) rmsWindow += samples[i] * samples[i];

  let endSample = samples.length;
  for (let i = samples.length - 1; i >= windowSize; i--) {
    const rms = Math.sqrt(rmsWindow / windowSize);
    if (rms > silenceThreshold) {
      endSample = Math.min(samples.length, i + Math.floor(sampleRate * 0.05));
      break;
    }
    rmsWindow -= samples[i] * samples[i];
    rmsWindow += samples[i - windowSize] * samples[i - windowSize];
  }

  if (endSample <= startSample + sampleRate * 0.1) {
    endSample = samples.length;
    startSample = 0;
  }

  const trimmedLength = endSample - startSample;
  const trimmed = new Float32Array(trimmedLength);
  buffer.copyFromChannel(trimmed, 0, startSample);

  const outCtx = new AudioContext();
  const outBuffer = outCtx.createBuffer(1, trimmedLength, sampleRate);
  outBuffer.copyToChannel(trimmed, 0, 0);
  await outCtx.close();

  return { wavBytes: audioBufferToWav(outBuffer), duration: trimmedLength / sampleRate };
}
