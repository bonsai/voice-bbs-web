// UI パターン切替 (A/B/C)。localStorage に保持
import { ref } from 'vue'

export type UIMode = 'A' | 'B' | 'C'
const KEY = 'voice_bbs_ui_mode'

function initial(): UIMode {
  const v = localStorage.getItem(KEY)
  return v === 'A' || v === 'B' || v === 'C' ? v : 'B'
}

export const uiMode = ref<UIMode>(initial())

export function setUIMode(m: UIMode) {
  uiMode.value = m
  localStorage.setItem(KEY, m)
}
