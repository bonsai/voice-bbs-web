# Dev Stats — voice-bbs-web (2026-09-04 計測、HEAD 5808cd0)

> 計測範囲: セッション開始 a9762e5(初回クローン)〜HEAD。コマンド実測値。

## Git 基本

| 指標 | 値 |
|---|---|
| コミット数 | 52(all bonsai) |
| 追加行(テキスト) | +7,241 |
| 削除行 | -1,308 |
| 対象 | コード + docs/research + assets(png 除く) |

## コード(web-vue 主線)

| 指標 | 値 |
|---|---|
| src LOC(ts/vue) | 1,646 |
| テスト数(vitest) | 21 passed |
| build JS / gzip | 90 kB / 35 kB |
| typecheck | vue-tsc OK |
| UI パターン | A/B/C + ガイド + PWA Phase1 |

## 構成ファイル数

| 種別 | 数 |
|---|---|
| docs/*.md | 20 |
| research/*.md | 5(会議4+テンプレ等) |
| issues(issue.md 内) | 未[ ]22 / 完了[x]13 |

## 工程メモ

- フェーズ: CFデプロイ→修正→Vue移行(P2-P4)→UX 3案→デザインシステム→PWA Phase1
- スプリント: Sprint1〜4 実施(ガイド/トークン/リトライ/PWA)
- 残: D1 UX採点(実機)、PWA Phase2(SW)、バックエンド BE1〜7(別担当)

## 参考

- 実装経緯: docs/recap.md / docs/sprint-log.md / docs/issue.md
- トークン実績は未計測(計画見積 docs/plan.md §4)
