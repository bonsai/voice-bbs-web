<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { createApi, type Category, type Room } from '@/lib/api'
import Lobby from '@/components/Lobby.vue'
import RoomView from '@/components/RoomView.vue'

const api = createApi(localStorage)
const categories = ref<Category[]>([])
const bootError = ref<string | null>(null)

type View = { name: 'lobby' } | { name: 'room'; room: Room }
const view = ref<View>({ name: 'lobby' })
const roomCache = new Map<string, Room>()

function roomFromQuery(): Room | null {
  const id = new URLSearchParams(location.search).get('room')
  if (!id) return null
  const cached = roomCache.get(id)
  return cached ? { ...cached } : { id, category_id: '', title: null, device_id: '', created_at: 0 }
}

function syncFromUrl() {
  const r = roomFromQuery()
  view.value = r ? { name: 'room', room: r } : { name: 'lobby' }
}

function openRoom(room: Room) {
  roomCache.set(room.id, { ...room })
  history.pushState({}, '', `?room=${encodeURIComponent(room.id)}`)
  view.value = { name: 'room', room: { ...room } }
}

function goBack() {
  history.pushState({}, '', location.pathname)
  view.value = { name: 'lobby' }
}

onMounted(async () => {
  try {
    const { categories: cs } = await api.categories()
    categories.value = cs
  } catch (e) {
    bootError.value = e instanceof Error ? e.message : String(e)
  }
  syncFromUrl()
  window.addEventListener('popstate', syncFromUrl)
})

const currentRoom = computed(() => (view.value.name === 'room' ? view.value.room : null))
</script>

<template>
  <div class="min-h-screen">
    <Lobby v-if="view.name === 'lobby'" :categories="categories" @open="openRoom" />
    <RoomView
      v-else-if="currentRoom"
      :room="currentRoom"
      :categories="categories"
      @back="goBack"
    />
    <p v-if="bootError" class="p-4 text-rose-400 text-sm">起動エラー: {{ bootError }}</p>
  </div>
</template>
