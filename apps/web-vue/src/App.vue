<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '@/lib/api'

const status = ref<'checking' | 'ok' | 'error'>('checking')
const categoryCount = ref(0)

onMounted(async () => {
  try {
    await api.healthz()
    const { categories } = await api.categories()
    categoryCount.value = categories.length
    status.value = 'ok'
  } catch {
    status.value = 'error'
  }
})
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
    <h1 class="text-4xl font-bold tracking-tight">声の部屋</h1>
    <p class="text-slate-400 text-sm">ロビー(部屋一覧)は実装中 — Next.js からの移行雛形</p>

    <div class="text-xs text-slate-500">
      API:
      <span v-if="status === 'checking'" class="text-slate-400">確認中…</span>
      <span v-else-if="status === 'ok'" class="text-emerald-400">ok (categories: {{ categoryCount }})</span>
      <span v-else class="text-rose-400">接続不可 (dev は wrangler pages dev が必要)</span>
    </div>
  </main>
</template>
