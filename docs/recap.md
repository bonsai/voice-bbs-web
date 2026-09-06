# Work Recap — voice-bbs-web (2026-09-06 まとめ実装セッション)

> 方針: **Vue+Vite 主線、Next(web-next)残置・無視、バックエンド共通**。

## 状態(次回の出発点)

- フロント: T3 再生エフェクト完了、T-DS1 トークン適用完了、T4 エラーローカライズ完了、T5 キャッシュ修正、T8 マイクチェック導入済み
- vitest 21 passed / typecheck / build OK (JS 91 kB・gzip 35 kB)
- CI: `.github/workflows/ci.yml` 修正済み。secret 未設定時も test/build job は自走。deploy step のみ skip
- **BE1-P 完了: 本番切替済み。** https://voice-bbs-web.pages.dev は Vue アプリ稼働中 |

## 今セッションの完了(証拠)

| 項目 | commit |
|---|---|
| T3 再生中泡エフェクト(scale 1.12 + glow 二重化 + 他泡暗化 opacity 0.4) | `0254461` |
| T-DS1 デザイントークン適用(border-line 統一、color-mix alpha、フォールバック色) | `ecf2868` |
| T4 エラー localize(型付き RecorderErrorCode + computed message + encode_failed) | 本 push |
| T5 キャッシュクリア挙動修正(Promise reject 時に cache.delete + rethrow) | 本 push |
| T8 ランディング マイクチェック(Permissions API + dismiss バナー) | 本 push |
| CI ワークフロー堅牢化(secret 有無を step 出力で判定し常時テスト自走) | 本 push |

## 次の一手候補

- D1 UX 採点(実機6軸) / D3 会議#2 / D4 PWA 方針決定
- T6 アンビエント再生 / T7 接続状態オーバーレイ / T10 PWA 実装
- BE1-P 本番切替 / BE4-P `CLOUDFLARE_API_TOKEN` secret 設定(手動)

---

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
