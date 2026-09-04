// ロビー — カテゴリ + 部屋一覧 + 部屋作成(声で名前)。タッチ専用
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createApi, type Category, type Room } from '@/lib/api'
import { setUIMode, uiMode } from '@/lib/uiMode'
import CreateRoomSheet from '@/components/CreateRoomSheet.vue'
import { playPop } from '@/lib/sfx'

const props = defineProps<{ categories: Category[] }>()
const emit = defineEmits<{ open: [room: Room] }>()

const api = createApi(localStorage)
const active = ref('')
const rooms = ref<Room[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const sheet = ref(false)

// 装飾泡 (16 個: 4×4)
const decoBubbles = Array.from({ length: 16 }, (_, i) => {
  const h = i * 7 + 13
  return {
    x: 3 + (h % 9) * 10.5,
    y: 40 + ((h >> 3) % 4) * 18,
    dur: 4 + (h % 5),
    delay: -(h % 7),
    size: 14 + (h % 20),
  }
})

const catOf = (id: string) => props.categories.find((c) => c.id === id)
const activeCategory = () => catOf(active.value) ?? props.categories[0]

const hint = (m: 'A' | 'B' | 'C') =>
  m === 'A'
    ? '＋で部屋を作る → 部屋では下のボタンを長押しして吹き込む'
    : m === 'B'
      ? '＋で部屋を作る。部屋では泡に触れて聞く、空きを長押しで吹き込む'
      : '＋で部屋を作る。部屋では下のハンドルを上にスワイプして吹き込む'

async function load() {
  loading.value = true
  error.value = null
  try {
    const { threads } = await api.rooms(active.value ? { category: active.value } : undefined)
    rooms.value = threads
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

function select(catId: string) {
  active.value = catId
  void load()
}

async function created(title: string) {
  const cat = activeCategory()
  if (!cat) return
  try {
    const { id } = await api.createRoom({ category_id: cat.id, title: title || undefined })
    sheet.value = false
    await load()
    emit('open', { id, category_id: cat.id, title: title || null, device_id: '', created_at: Math.floor(Date.now() / 1000) })
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}

async function openRoom(r: Room) {
  playPop(0.3, 900)
  emit('open', r)
}

onMounted(() => {
  playPop(0.15, 600) // 起動ポップ
  void load()
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 pt-6 pb-28 min-h-screen relative">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold animate-title">声の部屋</h1>
      <!-- パターン切替(検証用) -->
      <div class="flex rounded-full border border-slate-700 overflow-hidden text-xs">
        <button v-for="m in ['A', 'B', 'C'] as const" :key="m"
          class="px-3 py-1.5 min-h-[36px]"
          :class="uiMode === m ? 'bg-white text-slate-950' : 'text-slate-400'"
          @click="setUIMode(m)">{{ m }}</button>
      </div>
    </div>
    <p v-if="!loading && rooms.length === 0" class="text-slate-400 text-xs mt-1 mb-3">泡が現れるまで少しお待ちを</p>
    <p v-else class="text-slate-400 text-xs mt-1 mb-3">UI {{ uiMode }}: {{ hint(uiMode) }}</p>

    <!-- 装飾泡 (データ読み込み前に浮かせる) -->
    <div v-if="loading" class="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        v-for="(b, i) in decoBubbles"
        :key="i"
        class="absolute rounded-full opacity-[0.04]"
        :style="{
          width: b.size + 'px', height: b.size + 'px',
          left: b.x + '%', top: b.y + '%', transform: 'translate(-50%,-50%)',
          background: 'white',
          animation: `float ${b.dur}s ease-in-out infinite alternate`, animationDelay: b.delay + 's',
        }"
      />
    </div>

    <div class="flex gap-2 flex-wrap mb-4">
      <button
        class="px-3 py-1 rounded-full text-sm border transition-colors min-h-[44px]"
        :class="active === '' ? 'border-white text-white' : 'border-slate-700 text-slate-400'"
        @click="select('')"
      >全部</button>
      <button
        v-for="c in categories" :key="c.id"
        class="px-3 py-1 rounded-full text-sm border border-slate-700 min-h-[44px] transition-colors"
        :class="active === c.id ? '' : 'text-slate-400'"
        :style="active === c.id ? { borderColor: c.color, color: c.color } : {}"
        @click="select(c.id)"
      >{{ c.name }}</button>
    </div>

    <p v-if="error" class="text-rose-400 text-sm mb-3">{{ error }}</p>

    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="(r, i) in rooms" :key="r.id"
        class="text-left rounded-2xl p-4 border border-slate-800 bg-slate-900/60 active:bg-slate-800 min-h-[92px] animate-card"
        :style="{ animationDelay: (i * 0.06) + 's', boxShadow: `0 0 0 1px ${catOf(r.category_id)?.color ?? '#64748b'}44` }"
        @click="openRoom(r)"
      >
        <div class="font-semibold truncate">{{ r.title || '無題の部屋' }}</div>
        <div class="text-xs text-slate-400 mt-1 flex items-center gap-2">
          <span :style="{ color: catOf(r.category_id)?.color }">{{ catOf(r.category_id)?.name ?? r.category_id }}</span>
          <span>声 {{ r.post_count ?? 0 }}</span>
        </div>
      </button>
    </div>
    <p v-if="loading" class="text-slate-500 text-sm mt-4">読み込み中…</p>
    <p v-else-if="rooms.length === 0" class="text-slate-500 text-sm mt-4">部屋がありません。＋で作れます</p>

    <!-- 部屋を作る(全モード共通 CTA) -->
    <button
      class="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 w-16 h-16 rounded-full bg-white text-slate-950 text-3xl shadow-xl active:scale-95"
      aria-label="新しい部屋"
      @click="sheet = true"
    >＋</button>

    <CreateRoomSheet
      v-if="sheet"
      :category-name="activeCategory()?.name ?? '無題'"
      :category-color="activeCategory()?.color ?? '#fff'"
      @close="sheet = false"
      @create="created"
    />
  </div>
</template>
