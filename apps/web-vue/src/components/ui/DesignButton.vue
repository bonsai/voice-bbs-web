<script setup lang="ts">
defineProps<{
  label: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  disabled?: boolean
}>()

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="ui-button"
    :class="`ui-button--${variant ?? 'primary'}`"
    @click="$emit('click', $event)"
  >
    {{ label }}
  </button>
</template>

<style scoped>
.ui-button {
  min-height: 44px;
  min-width: 44px;
  padding: 0.625rem 1rem;
  border: 1px solid var(--color-line);
  border-radius: 0.75rem;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 160ms ease, transform 160ms ease, background-color 160ms ease;
}
.ui-button:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.ui-button:active:not(:disabled) { transform: scale(0.98); }
.ui-button:disabled { opacity: 0.45; cursor: not-allowed; }
.ui-button--primary { background: var(--color-owner); color: #111827; border-color: transparent; }
.ui-button--secondary { background: var(--color-surface-2); color: #f8fafc; }
.ui-button--ghost { background: transparent; color: #e2e8f0; }
.ui-button--danger { background: #7f1d1d; color: #fff; border-color: #991b1b; }
@media (prefers-reduced-motion: reduce) { .ui-button { transition: none; } }
</style>
