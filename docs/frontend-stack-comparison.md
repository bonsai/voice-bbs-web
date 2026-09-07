# Frontend Stack Comparison

基準日: 2026-09-07

Voice BBS is a browser SPA centered on voice recording/playback, bubble UI, pointer interaction, and Cloudflare Pages/Functions + D1/R2.

## 評価モデル

比較は **仕上がり 50% + 開発コスト 50%** とする。

### 仕上がり — 50%

| 評価軸 | 重み |
|---|---:|
| 音声UX | 15% |
| バブル操作・タッチ体験 | 10% |
| ビジュアル/UI | 10% |
| レスポンシブ/PWA | 5% |
| アクセシビリティ | 5% |
| 安定性・エラー時UX | 5% |

### 開発コスト — 50%

| 評価軸 | 重み |
|---|---:|
| 実装工数 | 15% |
| コード量・変更範囲 | 8% |
| テスト/型チェック | 7% |
| ビルド・依存関係 | 5% |
| Cloudflare Pages デプロイ | 5% |
| 保守・運用 | 5% |
| 移行コスト | 5% |

## 測定ルール

- **Measured**: build / test / typecheck / bundle / source lines / dependency count など実測値のみ。
- **Qualitative**: UX、アクセシビリティ、DXなどを同一チェックリストで評価。
- 未計測値は `null` とし、推測値で補完しない。
- React PoC は Vue と同じ機能範囲・同じ環境・同じ測定手順で比較する。
- 詳細な収集基盤は `tools/metrics/README.md`、collector は `tools/metrics/collect.mjs`。

## 現状比較

| Axis | Vue 3 + Vite | Next.js | React + Vite |
|---|---|---|---|
| Current implementation | apps/web-vue | apps/web-next | apps/web-react (PoC) |
| SPA fit | strong | possible via static export | strong |
| Audio/canvas | straightforward | possible, with framework boundaries | straightforward |
| Existing test assets | Vitest | weaker existing assets | new setup |
| Build | Vite | Next build/export | Vite |
| Migration cost | current baseline | low if retained | high |

Existing repo measurements are documented in `docs/compare-next-vue.md`: Vue initial JS about 85 kB / gzip 33.4 kB; Next initial JS about 112 kB. React was previously unmeasured; the new collector is now available for the PoC.

## 判定

総合点だけでなく、**仕上がり / 開発コスト**を併記する。

- 高仕上がり・低コスト: 第一候補
- 高仕上がり・高コスト: 投資対効果を確認
- 低仕上がり・低コスト: MVP候補
- 低仕上がり・高コスト: 原則採用しない

## Decision

Keep Vue 3 + Vite as the current product line. Keep Next.js for comparison/rollback. React remains a controlled PoC candidate until the same metrics are collected.

## React PoC

The PoC covers Lobby, RoomView, VoiceBubble, and recorder in React + Vite. Next step is to run the same benchmark and manual review against Vue, then record measured values and weighted scores without mixing estimates into the dataset.
