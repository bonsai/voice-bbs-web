// App — History API による SPA ルーティング: '/' = ロビー, '/room/:id' = 部屋
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { createApi, type Category, type Room } from '@/lib/api'
import Lobby from '@/components/Lobby.vue'
import RoomView from '@/components/RoomView.vue'

const api = createApi(localStorage)
const categories = ref<Category[]>([])
const bootError = ref<string | null>(null)
const roomId = ref<string | null>(null)
const roomMeta = new Map<string, { title?: string | null; categoryId?: string }>()

function idFromPath(): string | null {
  const m = location.pathname.match(/^\/room\/([^/]+)/)
  return m ? decodeURIComponent(m[1]) : null
}
function syncFromPath() {
  roomId.value = idFromPath()
}

function openRoom(r: Room) {
  roomMeta.set(r.id, { title: r.title, categoryId: r.category_id })
  history.pushState({}, '', `/room/${encodeURIComponent(r.id)}`)
  roomId.value = r.id
}
function goBack() {
  if (history.state || location.pathname !== '/') history.back()
  else {
    history.pushState({}, '', '/')
    roomId.value = null
  }
}

onMounted(async () => {
  // 初期 UI パターン (ランダム)
  const patterns = ['p1', 'p2', 'p3', 'p4', 'p5']
  document.body.setAttribute('data-pattern', patterns[Math.floor(Math.random() * patterns.length)])

  try {
    const { categories: cs } = await api.categories()
    categories.value = cs
  } catch (e) {
    bootError.value = e instanceof Error ? e.message : String(e)
  }
  syncFromPath()
  window.addEventListener('popstate', syncFromPath)
})

const currentMeta = computed(() => (roomId.value ? roomMeta.get(roomId.value) ?? null : null))
</script>

<template>
  <div class="min-h-screen">
    <Lobby v-if="!roomId" :categories="categories" @open="openRoom" />
    <RoomView
      v-else
      :key="roomId"
      :room-id="roomId"
      :room-meta="currentMeta"
      :categories="categories"
      @back="goBack"
    />
    <p v-if="bootError" class="p-4 text-rose-400 text-sm">起動エラー: {{ bootError }}</p>
  </div>
</template>
