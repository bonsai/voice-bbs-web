<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  categoryName: string
  categoryColor?: string
  postCount?: number
}>(), { postCount: 0 })

const emit = defineEmits<{ open: [] }>()
</script>

<template>
  <button type="button" class="room-card" @click="emit('open')">
    <span class="room-card__title">{{ title || '無題の部屋' }}</span>
    <span class="room-card__meta">
      <span class="room-card__category" :style="categoryColor ? { color: categoryColor } : undefined">{{ categoryName }}</span>
      <span aria-hidden="true">·</span>
      <span>声 {{ postCount }}</span>
    </span>
  </button>
</template>

<style scoped>
.room-card {
  width: 100%;
  min-height: 96px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.45rem;
  text-align: left;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  color: #f8fafc;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-cat-none) 20%, transparent);
  font: inherit;
  cursor: pointer;
  transition: transform 160ms ease, background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}
.room-card:hover { background: var(--color-surface-2); transform: translateY(-1px); }
.room-card:active { transform: translateY(0) scale(0.99); }
.room-card:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.room-card__title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 650; }
.room-card__meta { display: flex; align-items: center; gap: 0.5rem; color: rgb(148 163 184); font-size: 0.75rem; }
.room-card__category { font-weight: 600; }
@media (prefers-reduced-motion: reduce) { .room-card { transition: none; } }
</style>
