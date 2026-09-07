<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <section class="ui-panel" aria-label="panel">
    <header v-if="title" class="ui-panel__header">{{ title }}</header>
    <div class="ui-panel__body"><slot /></div>
  </section>
</template>

<style scoped>
.ui-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-bubble);
  overflow: hidden;
}
.ui-panel__header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-line);
  font-weight: 700;
}
.ui-panel__body { padding: 1rem; }
</style>
