// 部屋作成シート — Voice-first。音声入力を主導線、テキスト入力をフォールバックにする
<script setup lang="ts">
import { ref } from 'vue'
import { useSpeechName } from '@/lib/useSpeech'
import { DesignButton, DesignSheet } from '@/components/ui'

defineProps<{ categoryName: string; categoryColor: string }>()
const emit = defineEmits<{ close: []; create: [title: string] }>()

const title = ref('')
const creating = ref(false)
const { supported, listening, interim, start, stop } = useSpeechName()

function onFinalText(text: string) {
  title.value = text
}

function tapMic() {
  if (listening.value) {
    stop()
    return
  }
  start(onFinalText)
}

async function submit() {
  if (creating.value) return
  creating.value = true
  try {
    emit('create', title.value.trim())
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <DesignSheet :open="true" :title="`${categoryName} の新しい部屋`" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="rounded-[var(--radius-card)] border border-line bg-surface-2/40 px-4 py-3">
        <p class="text-xs text-slate-500">カテゴリー</p>
        <p class="mt-1 text-sm font-semibold" :style="{ color: categoryColor }">{{ categoryName }}</p>
      </div>

      <button
        type="button"
        class="w-full min-h-[76px] rounded-[var(--radius-card)] border px-4 py-3 text-left transition-colors duration-160 focus-visible:outline-2 focus-visible:outline-offset-2"
        :class="listening ? 'border-rose-400 bg-rose-500/15 text-rose-100' : 'border-line bg-surface-2/40 text-slate-100 hover:bg-surface-2'"
        :aria-pressed="listening"
        @click="tapMic"
      >
        <span class="block font-semibold">{{ listening ? '聞いています…' : '声で部屋の名前を言う' }}</span>
        <span class="mt-1 block text-xs text-slate-400">{{ listening ? '名前を話してください' : '音声入力が使えない場合は下の入力欄へ' }}</span>
        <span v-if="interim" class="mt-2 block truncate text-sm text-slate-200">{{ interim }}</span>
      </button>

      <p v-if="!supported" class="text-xs leading-5 text-slate-500">この端末では音声入力に対応していません。テキスト入力をご利用ください。</p>

      <label class="block">
        <span class="mb-2 block text-xs font-medium text-slate-400">部屋の名前</span>
        <input
          v-model="title"
          maxlength="40"
          placeholder="40文字まで・空でも作成できます"
          class="min-h-11 w-full rounded-[var(--radius-card)] border border-line bg-surface-2 px-4 py-3 text-sm text-slate-100 outline-none focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-white/10"
        />
      </label>

      <div class="flex justify-end gap-2 pt-1">
        <DesignButton label="キャンセル" variant="ghost" @click="emit('close')" />
        <button
          type="submit"
          class="min-h-11 rounded-[var(--radius-card)] bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
          :disabled="creating"
        >
          {{ creating ? '作成中…' : '部屋を作る' }}
        </button>
      </div>
    </form>
  </DesignSheet>
</template>
