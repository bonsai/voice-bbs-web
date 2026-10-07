# Vue / Next.js / React 比較

基準日: 2026-09-07

Voice BBS は音声録音・再生、泡UI、pointer interaction、Cloudflare Pages/Functions、D1/R2を組み合わせたブラウザSPA。SSR/ISR/Server Componentsは必須ではない。

| 観点 | Vue 3 + Vite | Next.js | React + Vite |
|---|---|---|---|
| 現行実装 | `apps/web-vue` | `apps/web-next` | 未導入 |
| SPA | ◎ | ○ | ◎ |
| 音声/canvas | 素直 | 可能 | 素直 |
| テスト | Vitest既存 | 既存資産は弱め | 新規設計 |
| ビルド | Vite | Next build/static export | Vite |
| 移行コスト | 低 | 維持なら低 | 高 |

既存 `docs/compare-next-vue.md` の実測では、Vue初回JS約85 kB / gzip JS 33.4 kB、Next初回JS約112 kB。Reactは未実装なので未実測。

## 判断

1. 現行Voice BBSはVue 3 + Viteを継続。
2. Next.jsは比較・ロールバック用途として残す。
3. Reactは必要性が出た場合のみPoC。

## React PoC

Lobby / RoomView / VoiceBubble / recorderをReact + Viteで最小実装し、Vueと同条件でbundle size、build time、test、typecheck、pointer/audio実装、deployを比較する。

## 注意

実測値と一般的な技術評価を混同しない。React欄は現時点では候補評価であり、性能優位を主張しない。
