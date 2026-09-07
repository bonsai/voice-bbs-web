# Frontend Metrics Foundation

Voice BBS の Vue / React / Next 比較を、**仕上がり 50% + 開発コスト 50%**で評価するためのメトリクス基盤。

## 原則

1. **Measured と Qualitative を分離する**
2. 未計測値は `null` とし、推測値で埋めない
3. 同じ機能範囲・同じ環境で比較する
4. 総合点だけでなく「仕上がり / 開発コスト」も確認する

## 配点

### 仕上がり — 50%

| Metric | Weight |
|---|---:|
| 音声UX | 15 |
| バブル操作・タッチ体験 | 10 |
| ビジュアル/UI | 10 |
| レスポンシブ/PWA | 5 |
| アクセシビリティ | 5 |
| 安定性・エラー時UX | 5 |

### 開発コスト — 50%

| Metric | Weight |
|---|---:|
| 実装工数 | 15 |
| コード量・変更範囲 | 8 |
| テスト/型チェック | 7 |
| ビルド・依存関係 | 5 |
| Cloudflare Pages デプロイ | 5 |
| 保守・運用 | 5 |
| 移行コスト | 5 |

## 自動収集

```sh
node tools/metrics/collect.mjs vue
node tools/metrics/collect.mjs react
node tools/metrics/collect.mjs next
```

成果物は `tools/metrics/results/<target>.json`。dist/out のサイズ、JS/CSSサイズ、ソースファイル数/行数、依存数など、機械的に取得できる値を記録する。

## 手動/ベンチマーク収集

- build time: production build の実時間
- test: pass/fail、実行時間
- typecheck: pass/fail、実行時間
- audio UX: 録音→投稿→再生→停止の操作数と失敗数
- pointer UX: tap / longpress / keyboard の挙動差
- accessibility: keyboard、focus、reduced-motion、名称/状態
- deploy: 設定ファイル数、手順数、変更箇所

同一環境で複数回測定し、平均値だけでなく試行回数を残す。
