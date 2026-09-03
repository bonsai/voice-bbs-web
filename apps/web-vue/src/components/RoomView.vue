// 部屋ビュー — 声の泡が漂う空間。泡に触れると喋る。下部で録音(吹き込む)
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { createApi, type Category, type Room, type Voice } from '@/lib/api'
import { usePlayer } from '@/composables/usePlayer'
import { useRecorder, RECORD_MAX_SEC } from '@/composables/useRecorder'
import { bubbleSizePx } from '@/lib/bubble'

const props = defineProps<{ room: Room; categories: Category[] }>()
const emit = defineEmits<{ back: [] }>()

const api = createApi(localStorage)
const voices = ref<Voice[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const remaining = ref(4)
const notice = ref<string | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const { playingId, busyId, play } = usePlayer()

const color = computed(() => props.categories.find((c) => c.id === props.room.category_id)?.color ?? '#94a3b8')
const name = computed(() => props.categories.find((c) => c.id === props.room.category_id)?.name ?? props.room.category_id)

const { recording, elapsed, error: recError, start: recStart, stop: recStop } = useRecorder(
  canvasRef,
  async (base64, duration) => {
  try {
    await api.createVoice(props.room.id, { image_base64: base64, duration })
    await load()
    await loadCount()
    notice.value = '声を吹き込めました'
    setTimeout(() => (notice.value = null), 2500)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
})

// 泡レイアウト: 位置/アニメは voice.id ハッシュで決定的に
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
      x: 10 + (h % 80), // 10~90%
      y: 12 + (Math.floor(h / 97) % 68), // 12~80%
      dur: 6 + (h % 8),
      delay: -((h >> 3) % 10),
    }
  }),
)

async function load() {
  const { posts } = await api.voices(props.room.id)
  voices.value = posts
}
async function loadCount() {
  const { remaining: r } = await api.count()
  remaining.value = r
}

async function tap(v: Voice) {
  if (recording.value) return
  if (busyId.value === v.id) return
  if (playingId.value === v.id) {
    await play(v.audio_url, v.id) // トグルで停止
    return
  }
  await play(v.audio_url, v.id)
}

onMounted(async () => {
  loading.value = true
  error.value = null
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
  <div class="flex flex-col">
    <!-- header -->
    <header class="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
      <button class="text-slate-400 hover:text-white text-lg px-1" aria-label="ロビーへ戻る" @click="emit('back')">‹</button>
      <div class="flex-1 min-w-0">
        <div class="font-semibold truncate">{{ room.title || '無題の部屋' }}</div>
        <div class="text-xs flex items-center gap-2" :style="{ color }">{{ name }}
          <span class="text-slate-500">・声 {{ voices.length }}</span>
        </div>
      </div>
      <!-- slots -->
      <div class="flex gap-1" title="本日の残り投稿枠">
        <span v-for="i in 4" :key="i" class="w-2 h-2 rounded-full"
          :class="i <= 4 - remaining ? 'bg-slate-700' : 'bg-emerald-400'" />
      </div>
    </header>

    <p v-if="error" class="px-4 py-2 text-rose-400 text-sm">エラー: {{ error }}</p>
    <p v-if="recError" class="px-4 py-2 text-amber-300 text-sm">
      {{ recError === 'volume_low' ? '声が小さすぎます' : recError === 'too_short' ? '短すぎます' : recError === 'mic_denied' ? 'マイクを許可してください' : '録音に失敗しました' }}
    </p>
    <p v-if="notice" class="px-4 py-2 text-emerald-300 text-sm">{{ notice }}</p>

    <!-- bubble space(高さを明示: flex-1 は親の高さ不定で潰れるため固定) -->
    <div class="relative overflow-hidden mt-2" style="height: min(60vh, 540px)">
      <p v-if="loading" class="text-slate-500 text-sm text-center mt-16">読み込み中…</p>
      <p v-else-if="voices.length === 0" class="text-slate-500 text-sm text-center mt-16">
        まだ声がありません。下のボタンを長押しして吹き込んでみてください
      </p>
      <button
        v-for="it in items" :key="it.id"
        class="absolute rounded-full overflow-hidden select-none"
        :class="playingId === it.id ? 'z-10' : ''"
        :style="{
          width: it.size + 'px',
          height: it.size + 'px',
          left: it.x + '%',
          top: it.y + '%',
          transform: 'translate(-50%,-50%)',
          backgroundImage: `url(${it.audio_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: `2px solid ${color}aa`,
          boxShadow: playingId === it.id
            ? `0 0 40px ${color}, 0 0 0 2px ${color}`
            : `inset -12px -12px 24px rgba(0,0,0,0.55), inset 8px 8px 20px rgba(255,255,255,0.2), 0 4px 20px ${color}44`,
          animation: `float ${it.dur}s ease-in-out infinite alternate`,
          animationDelay: it.delay + 's',
          transition: 'box-shadow .15s',
        }"
        :aria-label="'再生: ' + (it.duration.toFixed(1)) + '秒'"
        @click="tap(it)"
      >
        <span v-if="playingId === it.id" class="absolute inset-0 flex items-center justify-center text-white/90 text-xs drop-shadow">
          ♪
        </span>
      </button>
    </div>

    <!-- recorder -->
    <div class="px-4 py-4 flex flex-col items-center gap-2 border-t border-slate-800">
      <canvas
        ref="canvasRef"
        class="w-full max-w-md h-10 rounded bg-slate-900/70"
        :class="recording ? '' : 'hidden'"
      />
      <div
        class="relative w-20 h-20 rounded-full flex items-center justify-center text-center leading-tight text-xs select-none touch-none"
        :class="recording ? 'bg-rose-500 scale-110' : 'bg-white/15'"
        style="transition: all 0.1s"
        @pointerdown.prevent="recStart"
        @pointerup.prevent="recStop"
        @pointerleave="recording && recStop()"
      >
        <span class="px-1">{{ recording ? Math.ceil(elapsed) + 's / ' + RECORD_MAX_SEC : '長押しで吹き込む' }}</span>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes float {
  0% { translate: 0 0; }
  100% { translate: 0 -24px 15px; }
}
</style>
