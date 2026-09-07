// ロビー — カテゴリ + 部屋一覧 + 部屋作成(声で名前)。Voice-first / touch-first
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createApi, type Category, type Room } from '@/lib/api'
import CreateRoomSheet from '@/components/CreateRoomSheet.vue'
import { playPop } from '@/lib/sfx'
import { CategoryChip, DesignButton, RoomCard } from '@/components/ui'

const props = defineProps<{ categories: Category[] }>()
const emit = defineEmits<{ open: [room: Room] }>()

const api = createApi(localStorage)
const active = ref('')
const rooms = ref<Room[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const sheet = ref(false)

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}
const canInstall = ref(false)
let installEvt: BeforeInstallPromptEvent | null = null
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
}
function onInstallPrompt(e: Event) {
  e.preventDefault()
  if (isStandalone()) return
  installEvt = e as BeforeInstallPromptEvent
  canInstall.value = true
}
async function install() {
  if (!installEvt) return
  await installEvt.prompt()
  installEvt = null
  canInstall.value = false
}
window.addEventListener('beforeinstallprompt', onInstallPrompt)

const catOf = (id: string) => props.categories.find((c) => c.id === id)
const activeCategory = () => catOf(active.value) ?? props.categories[0]

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

function openRoom(r: Room) {
  playPop(0.3, 900)
  emit('open', r)
}

const micBanner = ref(false)
function dismissMicBanner() {
  micBanner.value = false
  localStorage.setItem('voice_bbs_mic_dismissed', '1')
}

onMounted(() => {
  playPop(0.15, 600)
  void load()
  if (!localStorage.getItem('voice_bbs_mic_dismissed')) {
    navigator.permissions?.query({ name: 'microphone' as PermissionName }).then((r) => {
      if (r.state !== 'granted') micBanner.value = true
    }).catch(() => { /* noop */ })
  }
})
</script>

<template>
  <main class="mx-auto min-h-screen w-full max-w-3xl px-4 pt-6 pb-28">
    <header class="mb-5">
      <div class="flex items-end justify-between gap-4">
        <div class="min-w-0">
          <p class="text-xs tracking-[0.18em] text-slate-500 uppercase">VOICE BBS</p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight">声の部屋</h1>
          <p class="mt-1 text-sm text-slate-400">気になる部屋に入って、声で会話する。</p>
        </div>
      </div>
    </header>

    <section v-if="canInstall || micBanner" class="mb-5 space-y-2" aria-label="案内">
      <div v-if="canInstall" class="rounded-[var(--radius-card)] border border-line bg-surface/80 px-4 py-3">
        <div class="flex items-center gap-3">
          <p class="flex-1 text-xs leading-5 text-slate-300">ホーム画面に追加すると全画面で使えます。</p>
          <DesignButton label="追加" variant="secondary" @click="install" />
        </div>
      </div>
      <div v-if="micBanner" class="rounded-[var(--radius-card)] border border-line bg-surface/80 px-4 py-3">
        <div class="flex items-center gap-3">
          <p class="flex-1 text-xs leading-5 text-slate-300">マイクを許可すると、部屋で声を吹き込めます。</p>
          <DesignButton label="閉じる" variant="ghost" @click="dismissMicBanner" />
        </div>
      </div>
    </section>

    <section aria-label="カテゴリ" class="mb-5">
      <div class="mb-2 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-200">カテゴリ</h2>
        <span class="text-xs text-slate-500">{{ rooms.length }} rooms</span>
      </div>
      <nav class="flex flex-wrap gap-2" aria-label="カテゴリフィルター">
        <CategoryChip label="全部" :active="active === ''" @select="select('')" />
        <CategoryChip
          v-for="c in categories"
          :key="c.id"
          :label="c.name"
          :color="c.color"
          :active="active === c.id"
          @select="select(c.id)"
        />
      </nav>
    </section>

    <p v-if="error" role="alert" class="mb-4 rounded-[var(--radius-card)] border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-300">{{ error }}</p>

    <section aria-label="部屋一覧">
      <div v-if="loading" class="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-live="polite">
        <div v-for="i in 4" :key="i" class="min-h-24 animate-pulse rounded-[var(--radius-card)] border border-line bg-surface/60" />
      </div>

      <div v-else-if="rooms.length" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RoomCard
          v-for="r in rooms"
          :key="r.id"
          :title="r.title || '無題の部屋'"
          :category-name="catOf(r.category_id)?.name ?? r.category_id"
          :category-color="catOf(r.category_id)?.color"
          :post-count="r.post_count ?? 0"
          @open="openRoom(r)"
        />
      </div>

      <div v-else class="rounded-[var(--radius-card)] border border-dashed border-line px-5 py-10 text-center">
        <p class="text-sm font-medium text-slate-300">まだ部屋がありません。</p>
        <p class="mt-1 text-xs leading-5 text-slate-500">最初の部屋を作って、声を浮かべてみましょう。</p>
      </div>
    </section>

    <div class="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 pointer-events-none">
      <div class="mx-auto flex max-w-3xl justify-end">
        <button
          type="button"
          class="pointer-events-auto grid size-16 place-items-center rounded-full bg-white text-3xl text-slate-950 shadow-xl shadow-black/25 transition-transform duration-160 active:scale-95 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
          aria-label="新しい部屋を作る"
          @click="sheet = true"
        >
          ＋
        </button>
      </div>
    </div>

    <CreateRoomSheet
      v-if="sheet"
      :category-name="activeCategory()?.name ?? '無題'"
      :category-color="activeCategory()?.color ?? '#fff'"
      @close="sheet = false"
      @create="created"
    />
  </main>
</template>
