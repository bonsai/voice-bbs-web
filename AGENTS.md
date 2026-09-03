# Voice BBS Web — AGENTS

本リポジトリで作業するエージェント向け。**「原理(変わらない規範)」と「状況(現時点のスナップショット)」を分離**して記す。規約の詳細は `docs/dx.md`。

---

## 原理 (PRINCIPLES — 変更しない)

1. **短く要点のみ**。報告は箇条書き。飾り・冗長なし。日本語で可。
2. **docs駆動**: 製品要求/設計/技術方針の変更は、実装より先に文書化 → 承認 → `docs/issue.md` 登録 → 実装 → 文書を実態へ追従。
3. **テスト先行**: 修正・リファクタ・新機能とも red → green → refactor。Runner は vitest。
4. **deny-by-default**: 破壊的操作(削除・上書き・リネーム・本番 deploy・既存ファイル変更)は事前に「対象・影響・代替」を一行で提示し、承認を得る。
5. **スコープ厳守**: 指示範囲のみ。曖昧な指示は一文の解釈を返して確認。量産・大量生成はサンプル1件で方向合わせ。
6. **完了宣言には証拠**: 実環境での確認まで。未検証は「暫定」と明記。
7. **文書の信頼度**: `STACK.md` / `deploy.md` = 実態(コードに合わせ最優先で正す)。`PRD.md` / `spec.md` = 方針・構想。
8. **commit**: 小分け・1行要約・日本語可。

## 状況 (STATE — 更新: 2026-09-03)

- **製品モデル v2**: スレッド → **部屋 (room)**。シャボン玉 = **声の泡**(1録音=1泡、**触ると喋る**)。`docs/PRD.md` / `docs/spec.md` v2
- **ADR-001 実行中**: フロントを Next.js → **Vue 3 + Vite + TS** へ移行(`docs/adr.md`、issue **N6**)。作業計画 = `docs/plan.md`(次は **P2: audioCodec テスト先行移植**)
- 構成:
  - `apps/web` — Next.js 実装(現本番稼働、Hono Functions + D1 + R2)
  - `apps/web-vue` — Vue 移行先(**P2〜P4 実装済み**、Hono Functions 同梱)。preview: https://voice-bbs-web-vue.pages.dev / テスト 21本緑
- **API 境界は不変**: 既存 Hono API・`/api/audio` 同一オリジンプロキシ・DB は移行対象外(Vue 側にも同梱済み)
- 本番: https://voice-bbs-web.pages.dev(実リソース・罠は `docs/deploy.md`)
- ブロッカー: `npm install` は peer conflict(next-on-pages)で `--legacy-peer-deps` が要 → 移行で解消見込み
- アクティブイシュー(`docs/issue.md` 新規=上): N6 移行[~] / N5 CI・vitest[!] / N4 依存衝突[!] / N3 削除UI[~]
- ドキュメント一式は `docs/` 配下(dx.md §2 に役割表): PRD / spec / adr / issue / kanban / STACK / deploy / test / dx / plan
