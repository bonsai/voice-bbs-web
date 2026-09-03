# ADR — アーキテクチャ決定記録

> 新しい決定を**上**に追記する。状態: `[ ]`提案 / `[x]`採用 / `[~]`実行中 / `[!]`保留

---

## ADR-001: フロントエンドを Next.js(React) から Vue へ移行する

**状態:** [x] 採用(実行は移行計画に基づく) / **日付:** 2026-09-03

### 文脈 (Context)

- 現状: Next.js 15 (App Router) の **static export SPA** + Hono on Cloudflare Pages Functions + D1 + R2(`docs/STACK.md`)。
- 本アプリは認証・SSR・動的ルーティングを必要としない**静的な単一画面 + ブラウザ完結の音声処理**。
- Next.js を static export で使うのは過剰構成で、以下が継続的な摩擦になっている:
  - 未使用 `@cloudflare/next-on-pages` 起因の npm peer conflict(`docs/deploy.md` §4-2)
  - App Router のエージェント向け規約(AGENTS.md)が生成・変更され続ける
  - 生成物の膨らみ(112kB first load)に対し使っているのは SPA の一部機能のみ
- 開発方針として「Vue + vitest の agentic workflow」(テスト先行・リファクタ安全網)を採用したい。

### 決定 (Decision)

**フロントエンドを Vue 3(Composition API) + Vite + TypeScript で再実装し、Cloudflare Pages の静的配信 + 既存 Hono Functions はそのまま維持する。**

- バックエンド(API/D1/R2/同一オリジンプロキシ)は**一切変更しない** — API 契約が移行の境界
- 音声コーデック(`audioCodec`)・録音/再生フローは **vitest でテストしつつ移植**(`docs/test.md`)
- Tailwind CSS v4 は維持(React 固有コードを剥がすだけ)

### 代替案 (Alternatives)

| 案 | 判断 | 理由 |
|---|---|---|
| **Vue 3 + Vite(採用)** | [x] | static SPA に最適。vitest との相性が良い。agentic workflow の主戦場 |
| Next.js 継続 | [ ] | peer conflict・過剰構成が残る。移行コストが増え続ける |
| Nuxt | [ ] | SSR/静的生成の強みが本アプリに不要。Vite 直構成より重い |
| SvelteKit / Solid 等 | [ ] | 慣性・周辺ツール含め Vue 方針(依頼)に合わせる |

### 結果 (Consequences)

- 良い影響:
  - peer conflict / next-on-pages から解放、`npm install` が素直になる
  - バンドル・依存が軽くなる
  - vitest + 型安全で、音声系ロジックのリファクタ安全網を先に張れる
  - Cloudflare Pages(静的)+ Functions 構成は**そのまま**なのでインフラ変更ゼロ
- 悪い影響/リスク:
  - UI の再実装コスト(ロビー/部屋ビュー、泡、録音 UI)
  - 既存ユーザーデータ・API は互換のため影響なし(デメリット小さめ)
  - 移行期間中のドキュメント用語(React/Next)との混在

### 移行手順(概略)

1. `docs/issue.md` に移行イシューを追加(N 系上部)
2. 新規 Vue アプリを別ディレクトリで立ち上げ(`apps/web-vue` 等)、**API は現行を参照**して動かす
3. コアロジック(`audioCodec` / recorder / player)を **vitest テスト付きで移植**(テスト先行)
4. UI を spec.md v2(room × 声の泡)で実装
5. 並行運用 → 切り替え(CF Pages の deploy 先を変更) → Next 側を削除
6. ドキュメント/kanban/issue を追従更新

### 関連

- `docs/spec.md` v2(room/泡 UX) / `docs/PRD.md` v2 / `docs/test.md`(vitest 計画)
- `docs/deploy.md` §4-2(peer conflict。移行で解消見込み)

### 待確認事項

- [ ] Vue 側ディレクトリ配置(`apps/web-vue`? Next 側との共存期間)
- [ ] UI ライブラリ不要で自前(Tailwind + 素のVue)か
- [ ] ルーティング: room 直接リンク `?room=` の SPA ハンドリング方針
- [ ] 「vue vitest agentic workflow」運用規約をどこに書くか(AGENTS.md?)
