// 部屋作成シート — 部屋名は「声で入力」(未対応/失敗時はテキスト入力)
<script setup lang="ts">
import { ref } from 'vue'
import { useSpeechName } from '@/lib/useSpeech'

const props = defineProps<{ categoryName: string; categoryColor: string }>()
const emit = defineEmits<{ close: []; create: [title: string] }>()

const title = ref('')
const creating = ref(false)
const error = ref<string | null>(null)
const { supported, listening, interim, start, stop } = useSpeechName()

async function onFinalText(text: string) {
  title.value = text
}

function tapMic() {
  if (listening.value) {
    stop()
    return
  }
  error.value = null
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
  <div class="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center" @click.self="emit('close')">
    <form class="bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]" @submit.prevent="submit">
      <div class="flex items-center justify-between">
        <div class="text-sm" :style="{ color: categoryColor }">{{ categoryName }} の新しい部屋</div>
        <button type="button" class="text-slate-400 text-xl px-2" aria-label="閉じる" @click="emit('close')">×</button>
      </div>

      <!-- 声で入力 -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex-1 rounded-xl px-4 py-4 text-center border"
          :class="listening ? 'bg-rose-500/20 border-rose-400 text-rose-200' : 'border-slate-700 text-slate-200'"
          @click="tapMic"
        >
          <span class="block text-lg">{{ listening ? '聞いています… 名前を言ってください' : '声で部屋の名前を言う' }}</span>
          <span v-if="interim" class="block text-sm text-slate-400 mt-1">{{ interim }}</span>
        </button>
      </div>
      <p v-if="!supported" class="text-xs text-slate-500">音声入力に未対応の端末です。下の入力欄をお使いください</p>
      <p v-if="error" class="text-xs text-rose-400">{{ error }}</p>

      <input
        v-model="title" maxlength="40" placeholder="部屋の名前(声で言うか、ここに入力。空でも可)"
        class="w-full bg-slate-800 rounded-xl px-4 py-3 text-sm outline-none"
      />
      <div class="flex justify-end gap-2">
        <button type="button" class="px-4 py-2 text-sm text-slate-400" @click="emit('close')">キャンセル</button>
        <button type="submit" class="px-5 py-2 rounded-xl text-sm bg-white text-slate-950" :disabled="creating">
          {{ creating ? '作成中…' : '部屋を作る' }}
        </button>
      </div>
    </form>
  </div>
</template>
