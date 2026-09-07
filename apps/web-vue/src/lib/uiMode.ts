// 正式FEはA方式を標準とする。旧A/B/C切替は検証用として廃止。
import { ref } from 'vue'
import type { UIMode } from '@/types/uiux'

export const uiMode = ref<UIMode>('A')
