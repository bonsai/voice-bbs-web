# Voice BBS Web — 移行作業計画 (issue N6 / ADR-001)

> 目的: Next.js → Vue 移行の **テスト計画・スケジュール・トークンコスト見積**。docs駆動(`docs/dx.md`)に従い、フェーズごとに検証ゲートを設ける。
> 参照: `docs/adr.md`(ADR-001) / `docs/test.md`(テスト方針) / `docs/spec.md` v2(room×泡) / `docs/STACK.md`(実装実態)

## 1. スコープ

- 対象: `apps/web-next`(Next) → `apps/web-vue`(Vue 3.5 + Vite 8 + TS + Tailwind4 + vitest 5)
- **API 境界は不変**: Hono Functions / D1 / R2 / `/api/audio` プロキシは触らない(既存アプリは稼働継続)
- UI は spec.md v2: ロビー(room 一覧) → 部屋(泡空間・触ると喋る・録音)
- 既存データはそのまま表示(移行・変換不要: room=thread, 泡=post)

## 2. テスト計画(移行時)

| 階層 | 対象 | 手法 | 環境 | 時期 |
|---|---|---|---|---|
| L0 純関数 | `audioCodec`(WAV 構造 / PNG バイト配置 / トリム境界)、`bubble`、`api`(URL/deviceId) | vitest 単体 | node | P2〜 |
| L0 回帰 | 移植元(Next)との**同一入力→同一出力**比較テスト | vitest fixture | node | P2 |
| L1 ロジック | recorder / player composable の状態遷移 | vitest + MediaRecorder/AudioContext モック | node | P4 |
| L2 コンポーネント | ロビー描画 / 泡タップ→再生ハンドラ | @vue/test-utils + jsdom | node | P4(P1 扱い) |
| L3 統合/手動 | 実 API(healthz/categories/threads/posts/audio)を web-vue から呼ぶ / **実ブラウザで録音→投稿→再生** | 手動スモーク | CF Pages | P5 |
| CI | vitest + typecheck(`vue-tsc`) を Actions 化 | — | GitHub | 切替後 |

### 受け入れ基準(全フェーズ共通 DoD)
- vitest 緑 / `npm run typecheck` 通過 / build OK
- L3 は実環境証拠(録音→再生の実動作)まで → 「暫定」禁止の対象は P5 のみ

## 3. 作業スケジュール(フェーズ)

| Ph | 作業 | 主な成果物 | 検証ゲート | 状態 |
|---|---|---|---|---|
| P1 | 文書整備(PRD/spec/ADR/issue/本計画) | docs 群 | レビュー | [x] 済み |
| P2 | `audioCodec` 移植 + テスト先行(L0 + fixture 回帰) | `src/lib/wav.ts` / `pngbytes.ts` / `silence.ts` + tests | vitest 17本緑 + typecheck | [x] 済み |
| P3 | API クライアント移植 + **ロビー UI**(room 一覧・カテゴリ) | `api.ts` / `Lobby.vue` | build + preview 表示 | [x] 済み |
| P4 | **部屋ビュー**: 泡フィールド・タップ再生・録音 composable 移植 | `RoomView.vue` / `usePlayer` / `useRecorder` | テスト21本緑 + preview API接続 | [x] 済み |
| P5 | 並行稼働 → CF Pages 切替 deploy + Next 削除・docs 追従 | 本番 URL | 実ブラウザ録音→再生 | [ ] |
| P6 | CI(Actions) + 残 P1 機能(削除 UI / PWA / ambient) | issue 消化 | CI 緑 | [ ] |

依存: P2 は他と独立。P3/P4 は P2 の上。P5 は P3+P4 完了が前提。CI は P2 から並行可能。

## 4. 予想トークンコスト

### 前提(仮定・要更新)
- モデル料率: **入力 \$3 / 100万 token・出力 \$15 / 100万 token**(frontier 級の概算)。為替 150 円/$
- 作業はエージェントが読む既存コード/文書 + 生成するコード/テスト/docs の合計で概算
- 誤差要因: 試行錯誤(ビルド/テスト修正)・レビュー往復で **2〜3 倍** 幅を持つ。フェーズゲート(緑)で増幅を止める

### フェーズ別見積(概算)

| Ph | 入力(k token) | 出力(k token) | コスト目安(USD) |
|---|---|---|---|
| P1 文書 | 20 | 12 | ~0.24 |
| P2 audioCodec | 25 | 18 | ~0.35 |
| P3 API+ロビー | 30 | 22 | ~0.42 |
| P4 部屋ビュー | 40 | 30 | ~0.57 |
| P5 切替/検証/docs | 25 | 15 | ~0.30 |
| P6 CI/残機能 | 30 | 25 | ~0.47 |
| **計** | **170** | **122** | **~2.4 USD(中央値)** |

### レンジ
- **低(順調・試行少)**: ~1.0–1.5 USD / 約 150–230 円
- **中央**: ~2.4 USD / 約 360 円
- **高(試行錯誤・仕様往復多)**: ~4–7 USD / 約 600–1,050 円

> 補足: デプロイ・CI 実行にトークン消費は無し(コマンド実行のみ)。実ブラウザ検証も人間/エージェントの操作コストは含まない。

## 5. リスクと緩和

| リスク | 緩和 |
|---|---|
| バイト配置の互換崩れ(既存音声が再生不能) | P2 の fixture 回帰テスト(実 WAV→PNG→WAV 往復)で事前検知 |
| UI 再実装のスコープ肥大 | spec v2 に忠実。P3/P4 でサンプル先行 |
| 切替後のデグレ | P5 までは既存 Next を並行稼働。切替後も旧 preview URL で比較可 |
| トークン超過 | 各フェーズ緑ゲート + 本見積のレンジ監視 |

## 6. 次アクション

1. P2 着手: `audioCodec` をテスト先行移植(実 WAV fixture 生成は `scripts/` に再現可能に)
2. 各フェーズ完了時に本計画の状態列と `docs/kanban.md` を更新
