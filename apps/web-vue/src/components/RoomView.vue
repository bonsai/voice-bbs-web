// 部屋ビュー — 泡に触れると聞く。録音導線がモードで変わる
// A: 下部ドック長押し / B: 空き・下部を長押し / C: ハンドルを上スワイプ
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { createApi, type Category, type Room, type Voice } from '@/lib/api'
import type { BubbleItem } from '@/types/uiux'
import { usePlayer } from '@/composables/usePlayer'
import { useRecorder, RECORD_MAX_SEC } from '@/composables/useRecorder'
import { bubbleSizePx } from '@/lib/bubble'
import { uiMode } from '@/lib/uiMode'
import { playPop } from '@/lib/sfx'

const props = defineProps<{ room: Room; categories: Category[] }>()
const emit = defineEmits<{ back: [] }>()

const api = createApi(localStorage)
const voices = ref<Voice[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const remaining = ref(4)
const notice = ref<string | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const spaceRef = ref<HTMLElement | null>(null)
const { playingId, busyId, play } = usePlayer()
const { recording, elapsed, error: recError, start: recStart, stop: recStop, cancel: recCancel } =
  useRecorder(canvasRef, async (base64, duration) => {
    try {
      await api.createVoice(props.room.id, { image_base64: base64, duration })
      await Promise.all([load(), loadCount()])
      notice.value = '声を吹き込めました'
      setTimeout(() => (notice.value = null), 2500)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    }
  })

const color = computed(() => props.categories.find((c) => c.id === props.room.category_id)?.color ?? '#94a3b8')
const name = computed(() => props.categories.find((c) => c.id === props.room.category_id)?.name ?? props.room.category_id)

// --- 泡レイアウト(位置は voice.id で決定的) ---
function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
const items = computed<BubbleItem[]>(() =>
  voices.value.map((v) => {
    const h = hashStr(v.id)
    return {
      ...v,
      size: bubbleSizePx(v.duration),
      x: 10 + (h % 80),
      y: 8 + (Math.floor(h / 97) % 74),
      dur: 6 + (h % 8),
      delay: -((h >> 3) % 10),
    }
  }),
)

// --- 録音ジェスチャ(空き/下部/ハンドル) ---
const ARM_MS = 260
const arm = ref<{ x: number; y: number } | null>(null)
let pressId = -1
let pressX = 0
let pressY = 0
let armTimer: ReturnType<typeof setTimeout> | null = null
let gesture: 'none' | 'armed' | 'recording' | 'swipe' = 'none'
let startY = 0
const swipeOpen = ref(false)

function pointOf(e: PointerEvent): { x: number; y: number } {
  const r = spaceRef.value?.getBoundingClientRect()
  return { x: e.clientX - (r?.left ?? 0), y: e.clientY - (r?.top ?? 0) }
}

function beginArm(e: PointerEvent) {
  if (recording.value || playingId.value || pressId !== -1) return
  pressId = e.pointerId
  pressX = e.clientX
  pressY = e.clientY
  gesture = 'none'
  const p = pointOf(e)
  armTimer = setTimeout(() => {
    if (pressId !== e.pointerId) return
    arm.value = { x: p.x, y: p.y }
    gesture = 'armed'
    navigator.vibrate?.(12)
    void recStart()
  }, ARM_MS)
}

function onMove(e: PointerEvent) {
  if (pressId !== e.pointerId) return
  const dy = startY !== 0 ? e.clientY - startY : 0
  const d = Math.hypot(e.clientX - pressX, e.clientY - pressY)
  if (uiMode.value === 'C') {
    // C: ハンドル上スワイプで開始
    if (gesture === 'none' && dy < -30) {
      gesture = 'swipe'
      swipeOpen.value = true
      void recStart()
    } else if (gesture === 'swipe' && d > 70) {
      recCancel()
      swipeOpen.value = false
      gesture = 'none'
    } else if (gesture === 'armed' && d > 60) {
      // B 用: 移動が大きければキャンセル
      clearArm()
      recCancel()
    }
    return
  }
  if (gesture === 'armed' && d > 46) {
    clearArm()
    recCancel()
  }
}

function onUp(e: PointerEvent) {
  if (pressId !== e.pointerId) return
  pressId = -1
  if (armTimer) {
    clearTimeout(armTimer)
    armTimer = null
  }
  if (uiMode.value === 'C') {
    if (gesture === 'swipe') {
      gesture = 'none'
      swipeOpen.value = false
      if (recording.value) recStop()
    }
    gesture = 'none'
    return
  }
  if (gesture === 'armed') {
    gesture = 'none'
    if (recording.value) recStop()
  }
  clearArm()
}

function clearArm() {
  arm.value = null
  gesture = 'none'
}

watch(recording, (r) => {
  if (!r) {
    arm.value = null
    gesture = 'none'
    swipeOpen.value = false
  }
})

function onBubbleDown(e: PointerEvent) {
  e.stopPropagation()
  if (armTimer) {
    clearTimeout(armTimer)
    armTimer = null
  }
  clearArm()
  pressId = -1
}

async function tap(v: Voice) {
  if (recording.value) return
  if (busyId.value === v.id) return
  playPop(0.3, 700) // タップ泡の音
  await play(v.audio_url, v.id)
}

async function load() {
  const { posts } = await api.voices(props.room.id)
  voices.value = posts
}
async function loadCount() {
  const { remaining: r } = await api.count()
  remaining.value = r
}

onMounted(async () => {
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerup', onUp, { passive: true })
  window.addEventListener('pointercancel', onUp, { passive: true })
  loading.value = true
  try {
    await Promise.all([load(), loadCount()])
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
})

// --- モード別の下部録音 UI ---
function dockDown(e: PointerEvent) {
  if (uiMode.value === 'A') {
    beginArm(e) // A: 押した瞬間に録音
    if (armTimer) clearTimeout(armTimer)
    armTimer = null
    void recStart()
  }
}
</script>

<template>
  <div class="flex flex-col min-h-screen select-none">
    <header class="flex items-center gap-3 px-4 py-3 border-b border-slate-800 sticky top-0 bg-slate-950/90 backdrop-blur z-20">
      <button class="text-slate-400 active:text-white text-2xl px-1 min-w-[44px] min-h-[44px]" aria-label="ロビーへ" @click="emit('back')">‹</button>
      <div class="flex-1 min-w-0">
        <div class="font-semibold truncate">{{ room.title || '無題の部屋' }}</div>
        <div class="text-xs" :style="{ color }">{{ name }}・声 {{ voices.length }}</div>
      </div>
      <div class="flex gap-1" title="本日残り投稿枠">
        <span v-for="i in 4" :key="i" class="w-2 h-2 rounded-full" :class="i <= 4 - remaining ? 'bg-slate-700' : 'bg-emerald-400'" />
      </div>
    </header>

    <p v-if="error" class="px-4 py-2 text-rose-400 text-sm">{{ error }}</p>
    <p v-if="recError" class="px-4 py-2 text-amber-300 text-sm">
      {{ recError === 'volume_low' ? '声が小さすぎました' : recError === 'too_short' ? '短すぎます' : recError === 'mic_denied' ? 'マイクを許可してください' : '録音に失敗しました' }}
    </p>
    <p v-if="notice" class="px-4 py-2 text-emerald-300 text-sm">{{ notice }}</p>

    <!-- 泡空間(B: 空き長押しで録音 / A・C: タップは聞くのみ) -->
    <div
      ref="spaceRef"
      class="relative overflow-hidden touch-none"
      style="height: min(58vh, 520px)"
      :class="uiMode === 'B' ? 'cursor-cell' : ''"
      @contextmenu.prevent
      @pointerdown="uiMode === 'B' && beginArm($event)"
    >
      <p v-if="loading" class="text-slate-500 text-sm text-center mt-16">読み込み中…</p>
      <template v-else>
        <p v-if="voices.length === 0" class="text-slate-500 text-sm text-center mt-14 px-6">
          {{ uiMode === 'A' ? 'まだ声がありません。下のボタンを長押しして吹き込んでください' : uiMode === 'B' ? 'まだ声がありません。この空間のどこかを長押しして吹き込んでください' : 'まだ声がありません。下のハンドルを上にスワイプして吹き込んでください' }}
        </p>
        <button
          v-for="(it, i) in items" :key="it.id"
          class="absolute rounded-full overflow-hidden animate-bubble-in"
          :style="{
            width: it.size + 'px', height: it.size + 'px',
            left: it.x + '%', top: it.y + '%', transform: 'translate(-50%,-50%)',
            backgroundImage: `url(${it.audio_url})`, backgroundSize: 'cover', backgroundPosition: 'center',
            border: `2px solid ${color}aa`,
            boxShadow: playingId === it.id ? `0 0 44px ${color}` : `inset -12px -12px 24px rgba(0,0,0,0.5), 0 4px 18px ${color}33`,
            animation: `bubble-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both, float ${it.dur}s ease-in-out infinite alternate`,
            animationDelay: `${(i * 0.08) + it.delay}s`,
            transition: 'box-shadow .12s, transform .12s',
          }"
          :aria-label="it.duration.toFixed(1) + '秒の声を聞く'"
          @pointerdown.stop="onBubbleDown"
          @click="tap(it)"
        >
          <span v-if="playingId === it.id" class="absolute inset-0 flex items-center justify-center text-white/90">♪</span>
        </button>
        <!-- B: 録音アームの予告リング -->
        <div
          v-if="arm && recording"
          class="absolute rounded-full pointer-events-none border-2 border-rose-400/80"
          :style="{
            left: arm.x + 'px', top: arm.y + 'px',
            width: 64 + Math.min(elapsed * 14, 120) + 'px',
            height: 64 + Math.min(elapsed * 14, 120) + 'px',
            transform: 'translate(-50%,-50%)',
          }"
        />
      </template>
    </div>

    <!-- 下部: モード別録音導線 -->
    <div class="border-t border-slate-800 bg-slate-900/80">
      <!-- 波形(A/B 録音中) -->
      <canvas ref="canvasRef" class="w-full h-10 hidden" :class="recording && uiMode !== 'C' ? '!block' : ''" />

      <!-- A: 中央ドック(長押し=吹き込む) -->
      <div v-if="uiMode === 'A'" class="flex flex-col items-center py-3 gap-2" @pointerdown="dockDown" @pointerup="recStop" @pointerleave="recording && recCancel()">
        <div
          class="w-20 h-20 rounded-full flex items-center justify-center text-center leading-tight text-xs"
          :class="recording ? 'bg-rose-500 scale-105' : 'bg-white/15'"
          style="transition: all .1s"
        >
          {{ recording ? Math.ceil(elapsed) + 's' : '長押しで吹き込む' }}
        </div>
        <div class="text-[11px] text-slate-500">泡に触れると聞ける・もう一度で停止</div>
      </div>

      <!-- B: 下部全域が録音ゾーン(長押し)。ヒント表示 -->
      <div
        class="flex items-center justify-center gap-2 h-16 touch-none"
        :class="recording ? 'bg-rose-500/15' : ''"
        @pointerdown="beginArm($event)"
        @contextmenu.prevent
      >
        <span class="text-xs" :class="recording ? 'text-rose-200' : 'text-slate-400'">
          {{ recording ? `吹き込み中… ${Math.ceil(elapsed)}s / ${RECORD_MAX_SEC}s(離すと投稿)` : 'この下の帯・空間の空きを長押し = 吹き込む' }}
        </span>
      </div>

      <!-- C: ハンドル(上スワイプで録音シート) -->
      <div v-if="uiMode === 'C'" class="relative">
        <div class="flex items-center justify-center h-14 touch-none" @pointerdown="startY = $event.clientY; beginArm($event)">
          <span class="text-xs text-slate-400">長押ししたまま上にスワイプ = 吹き込む</span>
        </div>
        <div v-if="swipeOpen || recording" class="absolute bottom-full left-0 right-0 h-52 bg-slate-900/95 rounded-t-2xl flex flex-col items-center justify-center gap-2 pointer-events-none">
          <div class="text-rose-300 text-sm">{{ recording ? '吹き込み中…' : '準備中' }}</div>
          <div class="w-24 h-24 rounded-full flex items-center justify-center text-rose-100 border-2 border-rose-400/70" :class="recording ? 'animate-pulse bg-rose-500/20' : ''">
            {{ recording ? Math.ceil(elapsed) + 's' : '…' }}
          </div>
          <div class="text-[11px] text-slate-500">下に戻すとキャンセル / 指を離すと投稿</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes float {
  0% { translate: 0 0; }
  100% { translate: 0 -24px; }
}
</style>
