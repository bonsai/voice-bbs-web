# Work Recap — voice-bbs-web (2026-09-04 後半・Vue主線/フロント&デザイン)

> 方針(2026-09-04): **Vue+Vite 主線、Next(web-next)残置・無視、バックエンド共通**。バックエンドは別担当へ委譲(BE1〜7)。

## 状態(次回の出発点)

- フロント: SPA ルーティング(`/room/:id`)・本人削除UI・デザイントークン v1 導入済み。テスト21本緑
- preview: https://voice-bbs-web-vue.pages.dev(UIモード A/B/C はロビー右上で切替)
- 判断済み: D2(切替せず並行) / D5(自前トークン) / 会議#2(B主軸・ガイド→T-DS1→PWAの順)
- 未判断: D1 UX採点(実機)、D3 泡ガラス化、D4 PWA 方針

## 今セッションの完了(証拠)

| 項目 | commit |
|---|---|
| ドキュメント基盤・issue 再編・比較/計画/委譲/会議群 | docs 多数 |
| T1 SPA ルーティング(History API + _redirects) | `3539816` |
| T2 本人の泡 300ms 長押し → 削除シート | `3539816` |
| D5 デザイントークン v1(Tailwind @theme) | `66ff201` |
| UI/UX 会議#2 議事録(10分) | 本 recap と同push |
| Next→Vue 比較・ADR 根拠 | `a426fe2` |

## ブロッカー・保留

- npm peer conflict(web-next)は残置方針で放置
- D1 UX 採点は実機検証待ち。会議#2 決定は「B 主軸」
- バックエンド BE1〜7 は別担当へ渡す準備済み(`docs/backend-handoff.md`)

## 次の一手(会議#2 の決定順)

1. 録音ガイド初回モーダル(1枚)
2. T-DS1: 泡→シートのトークン適用(見た目不変で)
3. T3: 再生中/自分表示の泡エフェクト仕上げ
4. D4 後に PWA 化

## 数量

- vitest 21 passed / typecheck / build OK(JS 88 kB・gzip 34 kB)
- デザイントークン: semantic color・radius・shadow・motion v1
