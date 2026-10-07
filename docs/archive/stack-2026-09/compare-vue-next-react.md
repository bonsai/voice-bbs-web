# Vue vs Next.js vs React — Voice BBS 技術選定比較

> 目的: Voice BBS のフロントエンド候補を Vue 3 + Vite / Next.js / React の3軸で比較し、今後の採用・再移行判断を再現可能な資料にする。
> 基準日: 2026-09-07
> 実測ソース: `apps/web-vue` / `apps/web-next`。React単体は現行repoに実装がないため、React欄は「選択肢としての評価」とし、未実測値を実測値として扱わない。

## 1. 前提

Voice BBS は、音声録音・再生、泡UI、タッチ中心操作、Cloudflare Pages/Functions、D1/R2を組み合わせたブラウザSPAである。SSR/ISR/Server Componentsを必須要件とはしていない。

## 2. 比較表

| 観点 | Vue 3 + Vite | Next.js | React + Vite想定 |
|---|---|---|---|
| 現行コード | `apps/web-vue` | `apps/web-next` | 未導入 |
| UIモデル | SFC + Composition API | React/Next App Router | JSX + hooks |
| SPA適合 | ◎ | ○ (static exportなら可能) | ◎ |
| SSR/Server Components | 不要 | 利用可能だが本件では未使用 | 追加フレームワーク次第 |
| 音声/canvas処理 | 素直に分離可能 | 可能だがNext固有要素との境界整理が必要 | 素直に分離可能 |
| テスト基盤 | Vitest 21 passed の既存資産あり | 既存Next側はテスト資産が弱い | Vitest/RTL等を新規設計 |
| ビルド | Vite | Next build/static export | Vite |
| 現行の移行コスト | 低 | 現状維持なら低 | 高（新規実装） |
| 本番導線 | Vue側を主線化済み | 残置 | 未導入 |
| チーム学習コスト | 現行資産あり | 既存資産あり | 新規導入 |

## 3. 実測値（現行repo）

既存の `docs/compare-next-vue.md` に記録された測定では、Vue側の初回JSは約85 kB、gzip JSは33.4 kB。Next側は初回JS約112 kBという比較が残っている。

重要なのは数値そのものより、**同一プロダクトの現行コードで実測済みなのはVue/Nextまで**であり、Reactはまだ実装・ビルド比較の母集団に入っていない点である。

## 4. Voice BBSとの適合性

### Vue

現在の主線。SFC、Composition API、Vitest、Viteという構成が、音声・canvas・pointer interactionを中心としたブラウザ完結UIに合っている。既存のDesign System/VoiceBubble/RoomView資産もそのまま利用できる。

### Next.js

SSRやServer Componentsは本プロダクトの主要要件ではない。既存資料ではstatic export SPAとして利用しており、Next固有の構成が追加摩擦になっていた。既存実装を残す価値はロールバック／比較用途にある。

### React

React自体はUI層として十分適合するが、本repoには現時点でReact実装が存在しない。Reactへ移行するなら、Vueで蓄積したドメイン・UX・テスト資産を再実装するコストが発生するため、単純な技術更新理由だけでは優先度は低い。

## 5. 判断ルール

- **現行プロダクトを育てる:** Vue 3 + Viteを継続
- **SSR/Server Componentsが将来の明確な必要条件になった:** Next.js再評価
- **Reactエコシステム採用が事業上の強い制約になった:** React + Viteを候補化
- 数値比較を更新するときは、同一機能セット・同一環境・同一測定手順で再計測する

## 6. 次回検証

Reactを本当に比較対象にする場合は、最小PoCとしてLobby + RoomView + VoiceBubble + recorderの4画面/部品をReact + Viteで実装し、Vueと同条件で以下を測る。

1. build time
2. JS/CSS bundle size
3. unit test count / duration
4. typecheck time
5. pointer/audio integration complexity
6. production deploy complexity

## 7. 結論

現時点の証拠では、Voice BBSの主線をVue 3 + Viteから変更する理由はない。Next.jsは比較・退避用、Reactは将来のPoC候補として管理する。

この文書は「Vueが絶対に優れている」という宣言ではなく、**現行コードで何が実測され、何がまだ未検証かを分離する技術選定記録**とする。
