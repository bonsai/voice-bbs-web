# Voice BBS Web — 開発体制 / DX(docs駆動)

> 更新: 2026-09-03。**方針: ドキュメント駆動開発(docs-driven)**。実装の前に文書で合意し、実装後は文書を実態へ追従させる。

## 1. 開発体制

- **判断者(人間)**: bonsai。方針・スコープ・承認・破壊的操作の最終判断
- **実行者(AI エージェント群)**: pi / 各エージェント。文書化・実装・検証・整理を担当
- **原則**: エージェントは deny-by-default。不明確な指示は**一文で解釈を返して確認**してから着手

### 役割分担
| 対象 | 判断者 | 実行 |
|---|---|---|
| 製品要求・優先度 | bonsai | エージェントが PRD/issue へ書き出し |
| 設計(UX/技術) | bonsai + エージェント提案 | エージェントが spec/ADR 化 |
| 実装・テスト | エージェント(テスト先行) | 同上 |
| 本番デプロイ | bonsai 承認 | エージェント実行(`docs/deploy.md`) |

## 2. ドキュメント構成と役割(マスター一覧)

| 文書 | 役割 = 「何を」 | 更新トリガ | 信頼度 |
|---|---|---|---|
| `docs/PRD.md` | 要求(何を作るか・価値・スコープ) | 製品要求の変更 | 方針 |
| `docs/spec.md` | 設計(どう作るか・UX詳細) | 設計判断の変更 | 構想(実装と乖離時は注記) |
| `docs/adr.md` | アーキテクチャ決定と理由(新規上) | 技術方針の転換 | 決定 |
| `docs/issue.md` | 課題・イシュー(新規上・旧下) | 新課題/進捗変化 | 実行管理 |
| `docs/kanban.md` | 達成度・指示の追跡 | セッション単位 | 実績 |
| `docs/STACK.md` | 実装・アーキテクチャの**実態** | コードが変わったら | **実態(最優先で正す)** |
| `docs/deploy.md` | デプロイ・運用・罠 | 運用手順の変化 | 実運用 |
| `docs/test.md` | テスト方針・対象マップ | テスト計画の変化 | 方針 |
| `docs/dx.md` | 開発体制・本ドキュメント | 体制/フローの変化 | 規約 |

> 信頼度の向き: PRD/spec は「これから」、**STACK/deploy は「いま」**。実装が進んだら spec より STACK を正とする。

## 3. docs駆動フロー(標準ループ)

```
1. 依頼受領
2. 解釈を一文で返し確認(曖昧な場合)
3. 文書化で合意: 要求→PRD / 設計→spec / 技術方針→ADR(必要時)
4. 承認を得る
5. docs/issue.md にイシュー登録(新規=上) + kanban 更新
6. 実装(テスト先行: red→green→refactor)
7. 検証(ユニット→実環境)。証拠つきで完了報告
8. STACK/deploy/kanban/issue を実態へ追従更新
9. commit / push(小さいコミット、日本語 1 行要約)
```

### ルール
- **実装より先に文書**: モデル変更・技術転換は spec/PRD/ADR が先(実例: 部屋room×泡、Next→Vue)
- **文書は実態に追従**: コードと乖離したら STACK/deploy を修正。spec は「構想」注記で維持
- **イシューは上に新規**: 番号 N1…/旧1…の並びを維持(`docs/issue.md` 参照)
- **1 依頼 = 1 テーマ**: 量産・大改修はサンプル 1 件で方向合わせしてから

## 4. Agentic workflow 規約(エージェント向け)

- **テスト先行**: バグ修正・リファクタ・新機能とも red → green → refactor(`docs/test.md`)
- **境界をテスト可能に**: 外部依存(DOM/Network/Audio)はモック境界。純関数を優先
- **破壊的操作は事前許可**: 削除・上書き・リネーム・本番 deploy は対象と影響を一行提示
- **完了宣言は証拠つき**: 実環境での成功確認まで。未検証は「暫定」と明記
- **スコープ厳守**: 指示範囲のみ。既存ファイル変更は方針確認

## 5. DX 環境メモ

- wrangler は `apps/web/node_modules/.bin/wrangler`(Linux)。Windows global は不可(`docs/deploy.md` §4-3)
- npm install は peer conflict 解消まで `--legacy-peer-deps`(N4 / ADR-001 で解消予定)
- 認証: `CLOUDFLARE_API_TOKEN`(Workers/P pages/D1/R2 Edit)
- 予定: vitest 導入、GitHub Actions(CI=test系/refactor系) → issue N5

## 6. Definition of Done(完了条件)

- [ ] テスト緑(vitest。未導入機能は tsc/lint 通過まで)
- [ ] 実環境検証(本番 API/UI) or「暫定」明記
- [ ] issue / kanban の状態更新
- [ ] 関連 docs(STACK/deploy)が実態と一致
- [ ] commit(push)済み

## 7. 現在のアクティブ方針

- ADR-001: Next.js → Vue 3 + Vite 移行(`docs/adr.md`)
- spec/PRD v2: 部屋(room)×声の泡・触ると喋る(`docs/spec.md`)
- 移行は**docs駆動で**: issue 登録 → Vue 雛形 → テスト先行移植 → UI v2 → 切替
