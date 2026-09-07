<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  state?: 'idle' | 'focused' | 'playing' | 'loading' | 'error' | 'deleted' | 'owner'
  size?: number
  category?: 'want' | 'search' | 'trouble' | 'motetai' | 'none'
}>(), {
  label: 'voice',
  state: 'idle',
  size: 88,
  category: 'none',
})

const emit = defineEmits<{ activate: [] }>()
</script>

<template>
  <button
    type="button"
    class="voice-bubble"
    :class="[`voice-bubble--${state}`, `voice-bubble--${category}`]"
    :style="{ width: `${size}px`, height: `${size}px` }"
    :aria-label="label"
    :aria-pressed="state === 'playing'"
    @click="emit('activate')"
  >
    <slot>{{ state === 'loading' ? '…' : state === 'error' ? '!' : '●' }}</slot>
  </button>
</template>

<style scoped>
.voice-bubble {
  min-width: 44px;
  min-height: 44px;
  border: 1px solid color-mix(in srgb, currentColor 35%, transparent);
  border-radius: var(--radius-bubble);
  background: var(--color-surface-2);
  color: var(--color-cat-none);
  box-shadow: var(--shadow-bubble);
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
}
.voice-bubble:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.voice-bubble:hover:not(:disabled) { transform: scale(1.03); }
.voice-bubble--want { color: var(--color-cat-want); }
.voice-bubble--search { color: var(--color-cat-search); }
.voice-bubble--trouble { color: var(--color-cat-trouble); }
.voice-bubble--motetai { color: var(--color-cat-motetai); }
.voice-bubble--owner { color: var(--color-owner); }
.voice-bubble--playing { box-shadow: var(--shadow-bubble-play); transform: scale(1.05); }
.voice-bubble--loading { opacity: 0.7; }
.voice-bubble--error { color: #fca5a5; border-color: #ef4444; }
.voice-bubble--deleted { opacity: 0.35; text-decoration: line-through; }
@media (prefers-reduced-motion: reduce) { .voice-bubble { transition: none; } }
</style>
