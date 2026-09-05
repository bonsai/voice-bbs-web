# Voice BBS Web — 用語・略号早見表 (ABB)

> 会話/ドキュメントで使う ID・略語の意味を集約。docs 内で迷ったらここを見る。

## 1. ID 凡例(todo.md / issue.md)

| 接頭 | 意味 | 例 |
|---|---|---|
| T | 実装タスク(Task) | T1 ルーティング / T-DS1 トークン適用 |
| D | 意思決定(Decision) | D1 UX採用 / D5 デザインシステム |
| BE | バックエンド委譲 | BE1 ADMIN_TOKEN〜BE7 |
| Q | 検証・QA | Q1 実機検証 |
| O | Ops/CI | O1 GitHub Actions |
| R | Research/デザイン | R2 泡ガラス化 |
| V | 完了済み記録(issue) | V1〜V4 |
| N | 旧・新規イシュー(09-03 系) | N7 デコードバグ |
| 数字のみ | issue 本体(09-04 再編後) | #15 本番切替 |

状態記号: `[x]`完了 / `[~]`進行・部分 / `[ ]`未着手 / `[!]`ブロック

## 2. ドキュメント(docs/)略称

| 略 | 正式名 | 内容 |
|---|---|---|
| PRD | Product Requirements | 要求(何を作るか) |
| spec | spec.md | 設計(どう作るか・UX詳細) |
| ADR | Architecture Decision Record | 技術決定(001: Next→Vue 等) |
| STACK | STACK.md | 実装・アーキテクチャ実態 |
| DX | dx.md | 開発体制・docs駆動規約 |
| DoD | Definition of Done | 完了条件 |
| recap | recap.md | セッション振り返り |
| kanban | kanban.md | 達成度追跡 |

その他: ABB=本ファイル / PRD以外はファイル名どおり。

## 3. 技術・インフラ略語

| 略 | 意味 | 備考 |
|---|---|---|
| CF | Cloudflare | Pages/D1/R2 を総称 |
| D1 | Cloudflare D1 | SQLite 系 DB |
| R2 | Cloudflare R2 | オブジェクトストレージ |
| PWA | Progressive Web App | manifest/SW |
| SW | Service Worker | PWA オフライン |
| SPA | Single Page App | 遷移なしUI |
| STT/TTS | Speech-to-Text / Text-to-Speech | 声入力 / 音声合成 |
| FTS5 | SQLite 全文検索 | posts content 索引 |
| Hono | Hono(フレームワーク) | Pages Functions の API 層 |
| WAV/PNG | 音声/画像形式 | 音声をPNG埋め込みで保存 |

## 4. プロダクト用語

| 語 | 意味 |
|---|---|
| 部屋(room) | テーマの場。旧 thread |
| 声の泡(bubble) | 音声投稿1件。触ると喋る |
| device_id | 端末匿名ID。レート制限/本人削除の鍵 |
| UIパターン A/B/C | 録音導線の3案(ドック/文脈長押し/スワイプ) |

## 5. 環境・運用

- 本番(Next 残置): https://voice-bbs-web.pages.dev
- Vue preview(主線): https://voice-bbs-web-vue.pages.dev
- wrangler: `apps/web-next/node_modules/.bin/wrangler`(Linux版)
