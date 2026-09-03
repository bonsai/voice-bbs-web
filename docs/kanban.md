# Voice BBS Web — Kanban / 達成度 (2026-09-03)

> 凡例: `[x]`完了 / `[~]`進行・部分 / `[ ]`未着手 / `[!]`ブロック
> 参照: `docs/issue.md`(課題) / `docs/PRD.md`(要求) / `docs/STACK.md`(実装実態) / `docs/deploy.md`(運用) / `docs/test.md`(テスト計画)

## 1. 会話・指示ベース(今回セッション)

| # | 指示 | 状態 | 証拠・備考 |
|---|---|---|---|
| 1 | Cloudflare へデプロイ | [x] | https://voice-bbs-web.pages.dev 稼働。D1/R2/API 実検証済 |
| 2 | 再生できない不具合の修正 | [x] | r2.dev CORS不可 → 同一オリジンプロキシ化。実ブラウザで動作確認 |
| 3 | 修正の push | [x] | commit `5dedcd1` |
| 4 | スタックドキュメント整備 | [x] | `docs/STACK.md` (commit `0b4427c`) |
| 5 | テスト計画 | [x] | `docs/test.md` (commit `31d7daf`) |
| 6 | PRD | [x] | `docs/PRD.md`(本pushに同梱) |
| 7 | CICD (GitHub Actions: test系/refactor系) | [!] | 計画のみ(`docs/test.md` §6, `docs/issue.md` デプロイ戦略節)。**要 package.json の整理** |
| 8 | vitest 基盤導入 | [!] | `npm i -D vitest` が peer conflict で失敗(次節ブロッカー参照) |
| 9 | 達成度 kanban | [x] | 本ファイル |

## 2. Issue ベース (集約先: `docs/issue.md`)

| # | タイトル | 状態 | 備考 |
|---|---|---|---|
| 1 | Next.js+Hono+CF Pages scaffold & D1/R2 | [x] | 稼働中 |
| 2 | シャボン玉 UI / float アニメ | [x] | 実装済み |
| 3 | 音声録音 Hook (無音トリム・PNG encode) | [x] | useAudioRecorder 実装済み ※ISSUES.md 完了表に記載漏れ |
| 4 | Thread/Post API + R2 upload | [x] | レート制限・削除API 含む |
| 5 | PNG decode & 自動連続再生 | [x] | プロキシ配信に変更済み |
| 6 | TTS サンプル seed | [ ] | — |
| 7 | PWA (manifest / SW / offline) | [ ] | — |
| 8 | 投稿者本人削除 | [~] | API 実装済み・UI 未接続 |
| 9 | 古い投稿自動クリーンアップ | [ ] | — |
| 10 | 接続状態オーバーレイ | [ ] | — |
| 11 | ランディング マイクチェック | [ ] | — |
| 12 | DB テキスト検索 | [~] | API LIKE 検索 + FTS5 整備済み。UI 利用状況は要確認 |
| 13 | デプロイ戦略 | [~] | `docs/issue.md` デプロイ戦略節に集約。手動deployで本番稼働、自動化は未設定 |
| 14 | OpenAPI 仕様書 | [x] | `openapi.yaml` は repo に存在 ※ISSUES.md の「未push」記載は古い |

## 3. ドキュメント一覧

| ファイル | 状態 |
|---|---|
| `docs/spec.md` | 設計書(一部 未実装構想を含む。STACK.md が実態) |
| `docs/STACK.md` | [x] 実装・アーキテクチャ実態(deploy は `deploy.md` へ分離) |
| `docs/deploy.md` | [x] デプロイ・運用 |
| `docs/test.md` | [x] テスト方針 |
| `docs/PRD.md` | [x] 製品要求 |
| `docs/kanban.md` | [x] 本ファイル |

## 4. 達成度サマリ

- **今回セッションの指示**: 9 件中 7 完了、2 ブロック → **約 78%**
- **Issue P0 (1〜6,14)**: 6/7 完了(#6 TTS 未) → **86%**
- **Issue 全体 (1〜14)**: 完了 7 / 部分 2 / 未着手 5 → **完了率 50%**(部分含めれば ~64%)
- **テスト基盤 / CI/CD**: 未導入(計画文書のみ)

## 5. ブロッカー・次の一手

1. **npm peer conflict** — 未使用 `@cloudflare/next-on-pages` が `@cloudflare/workers-types@^5` と衝突し、`npm install` / vitest 追加 / CF Git 連携ビルドを阻害。
   → 一手: `package.json` から next-on-pages を削除 → `npm install` → vitest 導入 → CI。
2. **CICD 構築** — 上記解除後に GitHub Actions (`test.yml` = vitest + typecheck + lint) を追加。
3. **ISSUES.md / 13.md の現状反映** — 完了表(#3, #14)と #13 の結論(実績)を更新。
4. 次の実装候補: #8 削除 UI → #6 TTS seed → #7 PWA。
