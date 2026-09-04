// UI パターン切替 (A/B/C)。localStorage に保持
import { ref } from 'vue'
import type { UIMode } from '@/types/uiux'
const KEY = 'voice_bbs_ui_mode'

function initial(): UIMode {
  const modes: UIMode[] = ['A', 'B', 'C']
  return modes[Math.floor(Math.random() * 3)]
}

export const uiMode = ref<UIMode>(initial())

export function setUIMode(m: UIMode) {
  uiMode.value = m
  localStorage.setItem(KEY, m)
}
