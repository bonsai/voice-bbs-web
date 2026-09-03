// ロビー — カテゴリタブ + 部屋(room)一覧
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { createApi, type Category, type Room } from '@/lib/api'

const props = defineProps<{ categories: Category[] }>()
const emit = defineEmits<{ open: [room: Room] }>()

const api = createApi(localStorage)
const active = ref('')
const rooms = ref<Room[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showCreate = ref(false)
const newTitle = ref('')
const creating = ref(false)

const activeCategory = computed(() => props.categories.find((c) => c.id === active.value) ?? null)
const catOf = (id: string) => props.categories.find((c) => c.id === id)

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

async function select(catId: string) {
  active.value = catId
  await load()
}

async function createRoom() {
  const cat = activeCategory.value
  if (!cat || creating.value) return
  creating.value = true
  try {
    const { id } = await api.createRoom({
      category_id: cat.id,
      title: newTitle.value.trim() || undefined,
    })
    showCreate.value = false
    emit('open', { id, category_id: cat.id, title: newTitle.value.trim(), device_id: '', created_at: Math.floor(Date.now() / 1000) })
  } finally {
    creating.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-6">
    <h1 class="text-2xl font-bold mb-1">声の部屋</h1>
    <p class="text-slate-400 text-sm mb-4">泡に触れると、その声が話します</p>

    <!-- category tabs -->
    <div class="flex gap-2 flex-wrap mb-4">
      <button
        class="px-3 py-1 rounded-full text-sm border transition-colors"
        :class="active === '' ? 'border-white text-white' : 'border-slate-700 text-slate-400'"
        @click="select('')"
      >全部</button>
      <button
        v-for="c in categories"
        :key="c.id"
        class="px-3 py-1 rounded-full text-sm border border-slate-700 transition-colors"
        :class="active === c.id ? '' : 'text-slate-400'"
        :style="active === c.id ? { borderColor: c.color, color: c.color } : {}"
        @click="select(c.id)"
      >{{ c.name }}</button>
    </div>

    <p v-if="error" class="text-rose-400 text-sm mb-3">API エラー: {{ error }}</p>

    <!-- rooms -->
    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="r in rooms"
        :key="r.id"
        class="text-left rounded-2xl p-4 border border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 transition-colors"
        :style="{ boxShadow: `0 0 0 1px ${catOf(r.category_id)?.color ?? '#64748b'}44` }"
        @click="emit('open', r)"
      >
        <div class="text-lg font-semibold truncate">{{ r.title || '無題の部屋' }}</div>
        <div class="text-xs text-slate-400 mt-1 flex items-center gap-2">
          <span :style="{ color: catOf(r.category_id)?.color }">{{ catOf(r.category_id)?.name ?? r.category_id }}</span>
          <span>声 {{ r.post_count ?? 0 }}</span>
        </div>
      </button>
    </div>
    <p v-if="!loading && rooms.length === 0" class="text-slate-500 text-sm mt-4">
      部屋がありません。右下の＋から作れます
    </p>
    <p v-if="loading" class="text-slate-500 text-sm">読み込み中…</p>

    <!-- create -->
    <button
      class="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-white text-slate-950 text-2xl shadow-lg"
      aria-label="新しい部屋"
      @click="showCreate = !showCreate"
    >＋</button>
    <div
      v-if="showCreate && activeCategory"
      class="fixed inset-0 bg-black/60 flex items-center justify-center p-6"
      @click.self="showCreate = false"
    >
      <form class="bg-slate-900 rounded-2xl p-5 w-full max-w-sm space-y-3" @submit.prevent="createRoom">
        <div class="text-sm" :style="{ color: activeCategory.color }">カテゴリ: {{ activeCategory.name }}</div>
        <input
          v-model="newTitle" maxlength="40" placeholder="部屋の名前(空なら無題)"
          class="w-full bg-slate-800 rounded-lg px-3 py-2 text-sm outline-none"
        />
        <div class="flex justify-end gap-2">
          <button type="button" class="px-3 py-1.5 text-sm text-slate-400" @click="showCreate = false">キャンセル</button>
          <button type="submit" class="px-4 py-1.5 rounded-lg text-sm bg-white text-slate-950" :disabled="creating">
            {{ creating ? '作成中…' : '部屋を作る' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
