<script setup lang="ts">
defineProps<{ open: boolean; title?: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="ui-sheet-backdrop" @click.self="emit('close')">
      <section class="ui-sheet" role="dialog" aria-modal="true" :aria-label="title ?? 'dialog'">
        <header class="ui-sheet__header">
          <h2>{{ title }}</h2>
          <button class="ui-sheet__close" type="button" aria-label="閉じる" @click="emit('close')">×</button>
        </header>
        <div class="ui-sheet__body"><slot /></div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.ui-sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgb(0 0 0 / 0.6);
  padding: 0;
}
.ui-sheet {
  width: 100%;
  max-width: 36rem;
  max-height: 90vh;
  overflow: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-bottom: 0;
  border-radius: var(--radius-sheet) var(--radius-sheet) 0 0;
  box-shadow: 0 -12px 40px rgb(0 0 0 / 0.3);
}
.ui-sheet__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-line);
}
.ui-sheet__header h2 { margin: 0; font-size: 1rem; }
.ui-sheet__close {
  min-width: 44px;
  min-height: 44px;
  border: 0;
  border-radius: 9999px;
  background: var(--color-surface-2);
  color: #f8fafc;
  font-size: 1.5rem;
  cursor: pointer;
}
.ui-sheet__close:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.ui-sheet__body { padding: 1.25rem; }
@media (min-width: 640px) {
  .ui-sheet-backdrop { align-items: center; padding: 1rem; }
  .ui-sheet { border-bottom: 1px solid var(--color-line); border-radius: var(--radius-sheet); }
}
</style>
