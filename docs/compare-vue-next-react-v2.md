# Vue vs Next.js vs React — Voice BBS 技術選定比較

基準日: 2026-09-07。Vue/Next は現行repoの実測資料に基づく。Reactは未導入で未実測。

| 観点 | Vue 3 + Vite | Next.js | React + Vite |
|---|---|---|---|
| 現行コード | `apps/web-vue` | `apps/web-next` | 未導入 |
| SPA適合 | ◎ | ○ | ◎ |
| SSR | 不要 | 利用可能 | 別構成次第 |
| 音声/canvas | 素直 | 可能 | 素直 |
| テスト | Vitest既存 | 既存資産弱め | 新規設計 |
| 移行コスト | 低 | 維持なら低 | 高 |

既存 `docs/compare-next-vue.md` の実測: Vue初回JS約85 kB / gzip 33.4 kB、Next初回JS約112 kB。Reactは未実装。

判断: 現行はVue継続。Nextは比較・ロールバック用。Reactは必要時にLobby/RoomView/VoiceBubble/recorderの最小PoCで同条件比較する。
