import type { Room, Voice } from '@/lib/api'

/** UI 操作パターン (A: ドック / B: 文脈長押し / C: スワイプ) */
export type UIMode = 'A' | 'B' | 'C'

/** 画面遷移状態。SPA 内のロビー・部屋・部屋作成シートを表す */
export type ViewState =
  | { screen: 'lobby' }
  | { screen: 'room'; room: Room }
  | { screen: 'createRoom' }

/** 部屋空間に描画する「声の泡」1 つ分。Voice にレイアウト情報を付加 */
export interface BubbleItem extends Voice {
  size: number
  x: number
  y: number
  dur: number
  delay: number
}
