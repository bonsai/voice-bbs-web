<script setup lang="ts">
defineProps<{
  title?: string
  category?: string
  color?: string
  count?: number
}>()
</script>

<template>
  <section class="kc-banner" :style="{ '--kc-color': color ?? 'var(--color-cat-none)' }" aria-label="声コンペ">
    <div class="kc-copy">
      <p class="kc-eyebrow">KOE COMPE</p>
      <h2>{{ title ?? '声コンペ' }}</h2>
      <p>{{ category ? `${category}の声を聴き比べる` : '声を聴いて、吹き込んで、比べる' }}</p>
    </div>
    <div v-if="count !== undefined" class="kc-count">
      <strong>{{ count }}</strong>
      <span>voices</span>
    </div>
  </section>
</template>

<style scoped>
.kc-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  margin-bottom: 18px;
  border: 1px solid color-mix(in srgb, var(--kc-color), transparent 65%);
  border-radius: var(--radius-card, 18px);
  background: linear-gradient(135deg, color-mix(in srgb, var(--kc-color), transparent 88%), rgba(255,255,255,.025));
}
.kc-eyebrow {
  margin: 0 0 3px;
  font-size: 10px;
  letter-spacing: .18em;
  color: var(--kc-color);
  font-weight: 800;
}
h2 { margin: 0; font-size: 18px; font-weight: 750; }
.kc-copy p:last-child { margin: 3px 0 0; font-size: 12px; color: rgb(148 163 184); }
.kc-count { min-width: 58px; text-align: right; }
.kc-count strong { display: block; font-size: 24px; line-height: 1; }
.kc-count span { font-size: 9px; color: rgb(100 116 139); letter-spacing: .12em; text-transform: uppercase; }
@media (max-width: 480px) {
  .kc-banner { padding: 14px; }
}
</style>
