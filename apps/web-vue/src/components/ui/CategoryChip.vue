<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  color?: string
  active?: boolean
}>(), { active: false })

const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <button type="button" class="ui-chip" :class="{ 'ui-chip--active': active }" :style="active && color ? { borderColor: color, color } : undefined" :aria-pressed="active" @click="emit('select')">
    {{ label }}
  </button>
</template>

<style scoped>
.ui-chip { min-height: 44px; padding: 0.5rem 0.875rem; border: 1px solid var(--color-line); border-radius: var(--radius-bubble); background: transparent; color: rgb(148 163 184); font: inherit; font-size: 0.875rem; cursor: pointer; transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease; }
.ui-chip:hover { background: color-mix(in srgb, var(--color-surface-2) 75%, transparent); color: #f8fafc; }
.ui-chip:active { transform: scale(0.98); }
.ui-chip:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.ui-chip--active { background: color-mix(in srgb, currentColor 10%, transparent); font-weight: 650; }
@media (prefers-reduced-motion: reduce) { .ui-chip { transition: none; } }
</style>
