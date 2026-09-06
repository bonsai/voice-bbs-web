# Issues — voice-bbs-web

> 更新: 2026-09-05。**新しいイシューを上に**。状態: `[x]`完了 / `[~]`進行 / `[ ]`未着手 / `[!]`ブロック

## 新規イシュー(上・新しい順)

| # | 優先度 | タイトル | 状態 | 備考 |
|---|--------|----------|------|------|
| V4 | P0 | Next vs Vue 比較文書(切替判断の根拠) | [x] | `docs/compare-next-vue.md`。ADR-001 根拠の実測化。→ D2 判断材料 |
| T-DS1 | デザイントークンの既存コンポーネント適用(Bubble/Sheet/Card 等) | [x] | border-line 統一、color-mix、フォールバック色トークン化済み |
| D5 | P2 | 意思決定: デザインシステム導入方針 | [x] | 採用 a: 自前トークン+Tailwind v4 @theme。トークン v1 実装済み(`style.css`)。適用は T-DS1 |
| BE1-P | P0 | 本番切替: web-vue を master(production)へ昇格 | [!] | production branch は `master`(現行 web-next バンドルは ADMIN_TOKEN コード無し)。`wrangler pages deploy dist --project-name voice-bbs-web --branch master` → 本番 admin 検証。GO 待ち。preview 検証は完了(`docs/backend-handoff.md` BE1) |
| BE4-P | P1 | CI 有効化: `CLOUDFLARE_API_TOKEN` secret | [!] | GitHub リポジトリ secret 追加で deploy-preview ジョブが有効になる(BE4)。オーナー作業 |
| BE5 | P2 | D1/R2 運用メモ整備 | [ ] | migration 手順・データ整合チェック(`docs/deploy.md` §2 を運用手順として拡充) |
| TTS-RUN | P2 | TTS seed 実行 | [ ] | `OPENAI_API_KEY` + wrangler 認証で `node apps/web-vue/scripts/seed-tts.mjs --remote`(約30サンプル) |
| BE | P1 | バックエンド委譲(別担当) | [~] | 割当: **木村拓哉(kimura)** 2026-09-05。BE2/BE3/BE4/BE6/BE7 完了・BE1 は preview 検証済(残務: BE1-P)。(`docs/backend-handoff.md`) |
| D4 | P1 | 意思決定: PWA 化方針(SW 戦略含む) | [ ] | 選択肢は `docs/decision-options.md` #D4。決定後 ADR-00X 化→ T10 実装 |
| D3 | P2 | 意思決定: デザイン会議 #2 と泡ガラス化の要否 | [ ] | `docs/decision-options.md` #D3。→ R2 prototype |
| D2 | P0 | 意思決定: 本番切替タイミングと Next 撤去方針 | [x] | 決定: Next 残置・無視、Vue 主線で並行(バック共通)。`docs/decision-options.md` #D2。issue 15 は凍結 |
| D1 | P0 | 意思決定: UX パターン A/B/C の採用 | [ ] | `docs/decision-options.md` #D1。実機6軸検証が根拠。→ spec 反映 |
| V1 | P0 | Next.js → Vue 移行完了 | [x] | P2〜P4 実装済み。テスト21本緑。ロビー・部屋ビュー・泡タップ再生・録音・起動アニメーション完了 |
| V2 | P1 | UI モード A/B/C を起動時にランダム選択 | [x] | `uiMode.ts` を変更。リロードごとに A/B/C の其一が選ばれる |
| V3 | P1 | 起動アニメーション実装 | [x] | タイトル slide-in(0.6s)、泡装飾16個、カードエントランス(stagger)、泡エントランス(scale bounce)、タップ音 |
| 15 | P0 | 本番切替: Vue → Next 撤去 | [~] | 凍結(D2 決定で Next 残置・無視。必要時のみ再開) |
| 14 | P1 | iOS の部屋名「声で入力」代替策 | [ ] | iOS Safari は SpeechRecognition 非対応 |
| 13 | P1 | アンビエント再生 (spec §2-「アンビエント」) | [ ] | 各泡を低音量(-18dB)で再生。PannerNode / ゲインで空間定位。デフォルトOFF、右上トグル |
| 12 | P1 | 泡長押し → 本人削除メニュー | [x] | 300ms長押し+削除シート実装済み(RoomView.vue)。API も接続済み |
| 11 | P1 | 接続状態オーバーレイ | [ ] | 切断時グレースケール。手段は Realtime/ポーリング要検討 |
| 10 | P1 | ランディング マイクチェック | [x] | Permissions API + dismiss バナー実装済み(Lobby.vue) |
| 9 | P1 | 古い投稿自動クリーンアップ | [~] | 投稿時 n件保持(スレッド別100件/BE2)実装・ローカル検証済。全体TTL削除は未実装(cron不可・投稿時方式) |
| 8 | P1 | TTS seed | [~] | OpenAI TTS 30サンプル `scripts/seed-tts.mjs --remote`(BE3)。実行は `OPENAI_API_KEY` + wrangler認証 |
| 7 | P1 | PWA (manifest / SW / offline) | [ ] | セーフエリア・インストール導線含む |
| 6 | P2 | 部屋タイトルの音声入力 (STT) | [ ] | `SpeechRecognition`。iOS fallback 要設計 |
| 5 | P2 | アンビエント音量の空間定位 | [ ] | 画面中央からの距離でゲイン変調。泡の座標 (x%, y%) から算出 |
| 4 | P2 | 泡タップ時の再生中エフェクト強化 | [x] | scale(1.12) + glow 二重化 + 他泡暗化(opacity 0.4) 実装済み |
| 3 | P2 | キャッシュクリア時の挙動 | [x] | Promise reject 時に cache.delete + rethrow し、次回再 fetch 可能に修正済み |
| 2 | P2 | エラーメッセージのローカライズ | [x] | RecorderErrorCode 型付け + computed message + encode_failed 対応済み |
| 1 | P2 | ルートルーティング (`/`, `/room/:id`) | [x] | History API + `public/_redirects` による SPA ルーティング実装済み |

---

## 旧イシュー(下・再構築当初から整理)

### P0

| # | タイトル | 状態 | 備考 |
|---|----------|------|------|
| 6 | TTS サンプル seed | [~] | `scripts/seed-tts.mjs`(OpenAI TTS 30)。実行は要認証+KEY |
| 5 | PNGデコード & 自動連続再生プレイヤー | [x] | プロキシ配信(N1)に適合済み |
| 4 | Thread / Post API + R2 upload | [x] | 匿名・レート制限(4件/日/device) |
| 3 | 音声録音 Hook (無音トリム・PNG encode) | [x] | useAudioRecorder |
| 2 | シャボン玉 UI & float アニメ | [x] | — |
| 1 | Next.js + Hono + CF Pages scaffold & D1/R2 | [x] | — |

### P1

| # | タイトル | 状態 | 備考 |
|---|----------|------|------|
| 12 | DB テキスト検索 | [~] | API LIKE + FTS5(unicode61)整備済み。UI利用は要確認 |
| 11 | ランディング マイクチェック | [ ] | オンボーディング |
| 10 | 接続状態オーバーレイ | [ ] | 切断時グレースケール |
| 9 | 古い投稿自動クリーンアップ | [~] | 投稿時 n件保持(スレッド別100)実装済。cron TTL は未実装 |
| 8 | 投稿者本人削除 | [~] | API実装済み・UI未接続 (→ V3#12) |
| 7 | PWA (manifest / SW / offline) | [ ] | — |

---

## デプロイ戦略

**状態: [~]** 手動 deploy で本番稼働中。

| 方式 | 概要 | 状態 |
|---|---|---|
| 手動 deploy | `wrangler pages deploy out --project-name voice-bbs-web` | [x] 実績あり |
| Pages Git 連携 | CF Dashboard → Git 連携、push で自動 build/deploy | [ ] 未設定 |
| GitHub Actions | `cloudflare/pages-action` で deploy | [~] `.github/workflows/ci.yml` 作成済(BE4)。GitHub secret `CLOUDFLARE_API_TOKEN` 設定後に有効 |

詳細: `docs/deploy.md`

---

## ユーザー追加要望(口頭/指示抽出)

- Cloudflare のみで完結 / テキスト保存&検索
- コンペ形式(カテゴリ)スレッド / シャボン玉・ふわふわ / タップで Thread に入って auto 再生 / TTS サンプル