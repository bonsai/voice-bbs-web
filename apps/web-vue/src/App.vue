<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { createApi, type Category, type Room } from '@/lib/api'
import type { ViewState } from '@/types/uiux'
import Lobby from '@/components/Lobby.vue'
import RoomView from '@/components/RoomView.vue'

const api = createApi(localStorage)
const categories = ref<Category[]>([])
const bootError = ref<string | null>(null)

const view = ref<ViewState>({ screen: 'lobby' })
const roomCache = new Map<string, Room>()

function roomFromQuery(): Room | null {
  const id = new URLSearchParams(location.search).get('room')
  if (!id) return null
  const cached = roomCache.get(id)
  return cached ? { ...cached } : { id, category_id: '', title: null, device_id: '', created_at: 0 }
}

function syncFromUrl() {
  const r = roomFromQuery()
  view.value = r ? { screen: 'room', room: r } : { screen: 'lobby' }
}

function openRoom(room: Room) {
  roomCache.set(room.id, { ...room })
  history.pushState({}, '', `?room=${encodeURIComponent(room.id)}`)
  view.value = { screen: 'room', room: { ...room } }
}

function goBack() {
  history.pushState({}, '', location.pathname)
  view.value = { screen: 'lobby' }
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

const currentRoom = computed(() => (view.value.screen === 'room' ? view.value.room : null))
</script>

<template>
  <div class="min-h-screen">
    <Lobby v-if="view.screen === 'lobby'" :categories="categories" @open="openRoom" />
    <RoomView
      v-else-if="currentRoom"
      :room="currentRoom"
      :categories="categories"
      @back="goBack"
    />
    <p v-if="bootError" class="p-4 text-rose-400 text-sm">起動エラー: {{ bootError }}</p>
  </div>
</template>
