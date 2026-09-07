<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Voice } from '@/lib/api'
import { unpackRgbaToBytes } from '@/lib/pngbytes'
import { waveformSvgDataUri } from '@/lib/waveform'

const props = defineProps<{
  voice: Voice
  color: string
  mine: boolean
  playing: boolean
  size: number
  delay: number
  duration: number
}>()

const emit = defineEmits<{ activate: []; longpress: [] }>()
const waveform = ref<string | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null
let suppressClick = false

async function loadWaveform() {
  try {
    const response = await fetch(props.voice.audio_url)
    if (!response.ok) return
    const blob = await response.blob()
    const bitmap = await createImageBitmap(blob)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.drawImage(bitmap, 0, 0)
    bitmap.close()
    const rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    const wav = unpackRgbaToBytes(rgba)
    if (wav.length > 12) waveform.value = waveformSvgDataUri(wav, props.color)
  } catch {
    // 波形は補助表現。取得/復元に失敗しても音声再生はそのまま利用できる。
  }
}

function down(e: PointerEvent) {
  e.stopPropagation()
  timer = setTimeout(() => {
    suppressClick = true
    navigator.vibrate?.(20)
    emit('longpress')
  }, 300)
}
function up() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}
function click() {
  if (suppressClick) {
    suppressClick = false
    return
  }
  emit('activate')
}

onMounted(() => void loadWaveform())
</script>

<template>
  <button
    class="voice-bubble absolute rounded-full overflow-hidden"
    :class="playing ? 'z-10' : ''"
    :style="{
      width: size + 'px',
      height: size + 'px',
      transform: `translate(-50%,-50%) scale(${playing ? 1.12 : 1})`,
      opacity: playing ? 1 : undefined,
      borderColor: mine
        ? 'color-mix(in srgb, var(--color-owner), transparent 33%)'
        : `color-mix(in srgb, ${color}, transparent 33%)`,
      boxShadow: playing
        ? `0 0 44px ${color}, 0 0 80px ${color}66`
        : `inset -12px -12px 24px rgba(0,0,0,0.5), 0 4px 18px ${color}33`,
      animation: `float ${6 + (duration * 1.7)}s ease-in-out infinite alternate`,
      animationDelay: delay + 's',
      transition: 'box-shadow .18s, transform .18s, opacity .18s',
      backgroundColor: color,
    }"
    :aria-label="voice.duration.toFixed(1) + '秒の声'"
    @pointerdown="down"
    @pointerup="up"
    @pointerleave="up"
    @pointercancel="up"
    @click="click"
  >
    <span
      v-if="waveform"
      class="absolute inset-[16%] opacity-70 pointer-events-none"
      :style="{ backgroundImage: `url(${waveform})`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }"
      aria-hidden="true"
    />
    <span v-else class="absolute inset-[22%] rounded-full border border-white/20 pointer-events-none" aria-hidden="true" />
    <span v-if="playing" class="absolute inset-0 flex items-center justify-center text-white/90">♪</span>
    <span v-if="mine" class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-amber-400/90 text-[8px] leading-none flex items-center justify-center text-black">自</span>
  </button>
</template>

<style scoped>
.voice-bubble {
  border-width: 2px;
  border-style: solid;
  touch-action: manipulation;
}

@media (prefers-reduced-motion: reduce) {
  .voice-bubble {
    animation: none !important;
    transition: none !important;
  }
}
</style>
