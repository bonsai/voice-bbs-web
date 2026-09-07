# Vue / Next.js / React 比較

基準日: 2026-09-07

Voice BBS は音声録音・再生、泡UI、pointer interaction、Cloudflare Pages/Functions、D1/R2を組み合わせたブラウザSPA。SSR/ISR/Server Componentsは必須ではない。

| 観点 | Vue 3 + Vite | Next.js | React + Vite |
|---|---|---|---|
| 現行実装 | apps/web-vue | apps/web-next | 未導入 |
| SPA適合 | ◎ | ○ static export | ◎ |
| UI | SFC + Composition API | App Router | JSX + hooks |
| 音声/canvas | 素直 | 可能 | 素直 |
| テスト | Vitest既存 | 既存資産弱め | 新規設計 |
| ビルド | Vite | Next build/export | Vite |
| 移行コスト | 低 | 維持なら低 | 高 |

## 実測

既存 docs/compare-next-vue.md の実測ではVue初回JS約85 kB / gzip 33.4 kB、Next初回JS約112 kB。Reactは未実装・未計測。

## 判断

現行Voice BBSはVue 3 + Viteを継続。Next.jsは比較・ロールバック用に残置。Reactは必要時に最小PoCで実測する。

## React PoC

Lobby / RoomView / VoiceBubble / recorderをReact + Viteで実装し、Vueと同条件でbundle、build、test、typecheck、pointer/audio実装量、deployを比較する。
