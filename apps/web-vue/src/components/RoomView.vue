// 部屋ビュー — 泡に触れると聞く。本人の泡は長押しで削除メニュー。録音導線はモードで変わる
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { createApi, getDeviceId, type Category, type Voice } from '@/lib/api'
import { usePlayer } from '@/composables/usePlayer'
import { useRecorder, RECORD_MAX_SEC } from '@/composables/useRecorder'
import { bubbleSizePx } from '@/lib/bubble'
import { uiMode } from '@/lib/uiMode'

const props = defineProps<{
  roomId: string
  roomMeta?: { title?: string | null; categoryId?: string } | null
  categories: Category[]
}>()
const emit = defineEmits<{ back: [] }>()

const api = createApi(localStorage)
const myId = getDeviceId(localStorage)
const voices = ref<Voice[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const remaining = ref(4)
const notice = ref<string | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const spaceRef = ref<HTMLElement | null>(null)
const { playingId, play, stop } = usePlayer()
const { recording, elapsed, error: recError, start: recStart, stop: recStop, cancel: recCancel } =
  useRecorder(canvasRef, async (base64, duration) => {
    try {
      await api.createVoice(props.roomId, { image_base64: base64, duration })
      await Promise.all([load(), loadCount()])
      notice.value = '声を吹き込めました'
      setTimeout(() => (notice.value = null), 2500)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    }
  })

const cat = computed(() => props.categories.find((c) => c.id === props.roomMeta?.categoryId))
const color = computed(() => cat.value?.color ?? '#94a3b8')
const name = computed(() => cat.value?.name ?? (props.roomMeta?.categoryId || 'room'))
const roomTitle = computed(() => props.roomMeta?.title || '部屋')
const guideSteps = computed(() =>
  uiMode.value === 'A'
    ? ['泡に触れる = その声を聞く(もう一度で停止)', '下のボタンを長押し = 声を吹き込む', '黄色い泡は自分の声(長押しで消せる)']
    : uiMode.value === 'B'
      ? ['泡に触れる = その声を聞く', '空きや下の帯を長押し = 声を吹き込む', '黄色い泡は自分の声(長押しで消せる)']
      : ['泡に触れる = その声を聞く', '下のハンドルを上にスワイプ = 声を吹き込む', '黄色い泡は自分の声(長押しで消せる)'],
)

// --- 泡レイアウト(voice.id で決定的) ---
function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
interface Item extends Voice {
  size: number
  x: number
  y: number
  dur: number
  delay: number
}
const items = computed<Item[]>(() =>
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
const isMine = (v: Voice) => v.device_id === myId

// --- 本人削除: 泡長押し(300ms)でメニュー ---
const showGuide = ref(false)
const selVoice = ref<Voice | null>(null)
const deleting = ref(false)
let lpTimer: ReturnType<typeof setTimeout> | null = null
let lpSuppress = false

function bubbleDown(e: PointerEvent, v: Voice) {
  e.stopPropagation() // 空き長押し(録音)と競合しない
  if (recording.value || !isMine(v)) return
  lpSuppress = false
  lpTimer = setTimeout(() => {
    stop()
    selVoice.value = v
    lpSuppress = true
    navigator.vibrate?.(20)
  }, 300)
}
function bubbleUpCancel() {
  if (lpTimer) {
    clearTimeout(lpTimer)
    lpTimer = null
  }
}
async function tap(v: Voice) {
  bubbleUpCancel()
  if (recording.value || lpSuppress) {
    lpSuppress = false
    return
  }
  await play(v.audio_url, v.id)
}
async function doDelete() {
  const v = selVoice.value
  if (!v || deleting.value) return
  deleting.value = true
  try {
    await api.deleteVoice(v.id)
    selVoice.value = null
    await Promise.all([load(), loadCount()])
    notice.value = '声を消しました'
    setTimeout(() => (notice.value = null), 2500)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    deleting.value = false
  }
}

// --- 録音ジェスチャ(B: 空き長押し / C: スワイプ) ---
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
function clearArm() {
  arm.value = null
  gesture = 'none'
  if (armTimer) {
    clearTimeout(armTimer)
    armTimer = null
  }
}
function onMove(e: PointerEvent) {
  if (pressId !== e.pointerId) return
  const dy = startY ? e.clientY - startY : 0
  const d = Math.hypot(e.clientX - pressX, e.clientY - pressY)
  if (uiMode.value === 'C') {
    if (gesture === 'none' && dy < -30) {
      gesture = 'swipe'
      swipeOpen.value = true
      void recStart()
    } else if ((gesture === 'swipe' || gesture === 'armed') && d > 70) {
      recCancel()
      swipeOpen.value = false
      clearArm()
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
  if (uiMode.value === 'C') {
    const wasSwipe = gesture === 'swipe'
    if (wasSwipe && recording.value) recStop()
    clearArm()
    swipeOpen.value = false
    return
  }
  if (gesture === 'armed') {
    if (recording.value) recStop()
    clearArm()
  }
}
watch(recording, (r) => {
  if (!r) {
    arm.value = null
    gesture = 'none'
    swipeOpen.value = false
  }
})

async function load() {
  const { posts } = await api.voices(props.roomId)
  voices.value = posts
}
async function loadCount() {
  const { remaining: r } = await api.count()
  remaining.value = r
}

function dockDown() {
  if (uiMode.value !== 'A' || recording.value) return
  void recStart()
}

onMounted(async () => {
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerup', onUp, { passive: true })
  window.addEventListener('pointercancel', onUp, { passive: true })
  if (!localStorage.getItem('voice_bbs_guide_seen_v1')) {
    showGuide.value = true
    localStorage.setItem('voice_bbs_guide_seen_v1', '1')
  }
  loading.value = true
  try {
    await Promise.all([load(), loadCount()])
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col min-h-screen select-none">
    <header class="flex items-center gap-3 px-4 py-3 border-b border-line sticky top-0 bg-bg/90 backdrop-blur z-20">
      <button class="text-slate-400 active:text-white text-2xl px-1 min-w-[44px] min-h-[44px]" aria-label="ロビーへ" @click="emit('back')">‹</button>
      <div class="flex-1 min-w-0">
        <div class="font-semibold truncate">{{ roomTitle }}</div>
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

    <div ref="spaceRef" class="relative overflow-hidden touch-none" style="height: min(58vh, 520px)"
      :class="uiMode === 'B' ? 'cursor-cell' : ''" @contextmenu.prevent @pointerdown="uiMode === 'B' && beginArm($event)">
      <p v-if="loading" class="text-slate-500 text-sm text-center mt-16">読み込み中…</p>
      <template v-else>
        <p v-if="voices.length === 0" class="text-slate-500 text-sm text-center mt-14 px-6">
          {{ uiMode === 'A' ? 'まだ声がありません。下のボタンを長押しして吹き込んでください' : uiMode === 'B' ? 'まだ声がありません。この空間のどこかを長押しして吹き込んでください' : 'まだ声がありません。下のハンドルを上にスワイプして吹き込んでください' }}
        </p>
        <button
          v-for="it in items" :key="it.id"
          class="absolute rounded-full overflow-hidden"
          :class="[playingId === it.id ? 'z-10' : '', isMine(it) ? '' : '']"
          :style="{
            width: it.size + 'px', height: it.size + 'px',
            left: it.x + '%', top: it.y + '%', transform: 'translate(-50%,-50%)',
            backgroundImage: `url(${it.audio_url})`, backgroundSize: 'cover', backgroundPosition: 'center',
            border: `2px solid ${it.device_id === myId ? '#fbbf24' : color}aa`,
            boxShadow: playingId === it.id ? `0 0 44px ${color}` : `inset -12px -12px 24px rgba(0,0,0,0.5), 0 4px 18px ${color}33`,
            animation: `float ${it.dur}s ease-in-out infinite alternate`, animationDelay: it.delay + 's',
            transition: 'box-shadow .12s',
          }"
          :aria-label="it.duration.toFixed(1) + '秒の声'"
          @pointerdown="bubbleDown($event, it)"
          @pointerup="bubbleUpCancel"
          @pointerleave="bubbleUpCancel"
          @click="tap(it)"
        >
          <span v-if="playingId === it.id" class="absolute inset-0 flex items-center justify-center text-white/90">♪</span>
          <span v-if="isMine(it)" class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-amber-400/90 text-[8px] leading-none flex items-center justify-center text-black">自</span>
        </button>
        <div v-if="arm && recording" class="absolute rounded-full pointer-events-none border-2 border-rose-400/80"
          :style="{ left: arm.x + 'px', top: arm.y + 'px', width: 64 + Math.min(elapsed * 14, 120) + 'px', height: 64 + Math.min(elapsed * 14, 120) + 'px', transform: 'translate(-50%,-50%)' }" />
      </template>
    </div>

    <!-- 下部: 録音導線(A/B/C) -->
    <div class="border-t border-line bg-surface/80">
      <canvas ref="canvasRef" class="w-full h-10 hidden" :class="recording && uiMode !== 'C' ? '!block' : ''" />
      <div v-if="uiMode === 'A'" class="flex flex-col items-center py-3 gap-2">
        <div class="w-20 h-20 rounded-full flex items-center justify-center text-center leading-tight text-xs"
          :class="recording ? 'bg-rose-500 scale-105' : 'bg-white/15'" style="transition: all .1s"
          @pointerdown="dockDown" @pointerup="recStop" @pointerleave="recording && recCancel()">
          {{ recording ? Math.ceil(elapsed) + 's' : '長押しで吹き込む' }}
        </div>
        <div class="text-[11px] text-slate-500">泡に触れると聞く・もう一度で停止 / 黄色い泡は自分の声(長押しで消せる)</div>
      </div>
      <div v-if="uiMode === 'B'" class="flex items-center justify-center gap-2 h-16 touch-none"
        :class="recording ? 'bg-rose-500/15' : ''" @pointerdown="beginArm($event)" @contextmenu.prevent>
        <span class="text-xs" :class="recording ? 'text-rose-200' : 'text-slate-400'">
          {{ recording ? `吹き込み中… ${Math.ceil(elapsed)}s / ${RECORD_MAX_SEC}s(離すと投稿)` : '空き・この帯を長押し = 吹き込む。黄色い泡(自分の声)は長押しで消せる' }}
        </span>
      </div>
      <div v-if="uiMode === 'C'" class="relative">
        <div class="flex items-center justify-center h-14 touch-none" @pointerdown="startY = $event.clientY; beginArm($event)">
          <span class="text-xs text-slate-400">長押ししたまま上にスワイプ = 吹き込む</span>
        </div>
        <div v-if="swipeOpen || recording" class="absolute bottom-full left-0 right-0 h-52 bg-surface/95 rounded-t-2xl flex flex-col items-center justify-center gap-2 pointer-events-none">
          <div class="text-rose-300 text-sm">{{ recording ? '吹き込み中…' : '準備中' }}</div>
          <div class="w-24 h-24 rounded-full flex items-center justify-center text-rose-100 border-2 border-rose-400/70" :class="recording ? 'animate-pulse bg-rose-500/20' : ''">
            {{ recording ? Math.ceil(elapsed) + 's' : '…' }}
          </div>
          <div class="text-[11px] text-slate-500">下に戻すとキャンセル / 指を離すと投稿</div>
        </div>
      </div>
    </div>

    <!-- 初回ガイド -->
    <div v-if="showGuide" class="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-6" @click="showGuide = false">
      <div class="bg-surface border border-slate-700 rounded-3xl p-6 w-full max-w-sm space-y-4">
        <div class="font-bold text-lg">この部屋の使い方</div>
        <ul class="space-y-2 text-sm text-slate-300">
          <li v-for="(g, i) in guideSteps" :key="i" class="flex gap-2"><span class="text-emerald-400">・</span>{{ g }}</li>
        </ul>
        <button class="w-full py-3 rounded-xl bg-white text-slate-950 text-sm" @click="showGuide = false">わかった</button>
      </div>
    </div>

    <!-- 本人削除メニュー -->
    <div v-if="selVoice" class="fixed inset-0 bg-black/60 z-30 flex items-end" @click="selVoice = null">
      <div class="w-full bg-surface rounded-t-3xl p-5 space-y-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]" @click.stop>
        <div class="text-sm text-slate-300">この声を消しますか? <span class="text-slate-500">({{ selVoice.duration.toFixed(1) }}秒・本人のみ削除可)</span></div>
        <div class="flex gap-2">
          <button class="flex-1 py-3 rounded-xl bg-rose-500/90 text-white text-sm" :disabled="deleting" @click="doDelete">
            {{ deleting ? '削除中…' : 'この声を消す' }}
          </button>
          <button class="flex-1 py-3 rounded-xl bg-surface-2 text-slate-300 text-sm" @click="selVoice = null">キャンセル</button>
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
