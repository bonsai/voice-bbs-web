# Vue / Next.js / React 比較サマリ

基準日: 2026-09-07

Voice BBS は音声録音・再生、泡UI、pointer interaction、Cloudflare Pages/Functions、D1/R2を組み合わせたブラウザSPA。SSR/ISR/Server Componentsは必須ではない。

| 観点 | Vue 3 + Vite | Next.js | React + Vite |
|---|---|---|---|
| 現行実装 | apps/web-vue | apps/web-next | 未導入 |
| SPA適合 | ◎ | ○ | ◎ |
| 音声/canvas | 素直 | 可能 | 素直 |
| テスト | Vitest既存 | 既存資産弱め | 新規 |
| ビルド | Vite | Next build/export | Vite |
| 移行コスト | 低 | 維持なら低 | 高 |

実測済み: 既存資料ではVue初回JS約85 kB / gzip 33.4 kB、Next初回JS約112 kB。Reactは未実装・未計測。

判断: 現行はVue継続、Nextは比較・ロールバック用、Reactは必要時にLobby/RoomView/VoiceBubble/recorderの最小PoCで同条件比較。
