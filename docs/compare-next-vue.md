# Next.js vs Vue — 移行判断の根拠資料(実測つき)

> 役割: ADR-001(Next→Vue 移行)の根拠を実測値で補強し、本番切替(D2)判断の材料にする。
> 測定日: 2026-09-03〜04。ソースは `apps/web-next`(Next) と `apps/web-vue`(Vue)。

## 1. プロダクト要件との適合

| 観点 | Next.js 15(App Router) | Vue 3 + Vite |
|---|---|---|
| 本アプリの実体 | static export の単一 SPA | SPA(素直な構成) |
| 必要機能(SSR/ISR/Server Components) | **不使用** | 不要(そもそも無い) |
| 認証・動的ルート | 不使用 | 不要 |
| 過剰さ | App Router + AGENTS 自動生成ファイル等が摩擦 | 最小構成 |

## 2. 実測比較(ビルド成果物)

| 指標 | Next(本番) | Vue(apps/web-vue) | 備考 |
|---|---|---|---|
| JS 初回(総) | ~112 kB | ~85 kB | Vue が約 24% 軽い |
| JS gzip | (概算 ~35 kB) | 33.4 kB | CSS 4.8 kB |
| ビルド時間 | — | ~0.7 s(差分) | 参照値 |
| アセット | out/ | dist/ | Pages 構成は同じ |

## 3. 開発基盤(DX)

| 指標 | Next | Vue |
|---|---|---|
| テスト | **無し** | vitest **21 passed**(wav/pngbytes/silence/api/bubble) |
| 型検査 | 未設定 | `vue-tsc`(CI 化は未) |
| npm install | **peer conflict**(next-on-pages)→`--legacy-peer-deps` 必須 | **素直に通る** |
| 主要ロジック | canvas/AudioContext 混在・テスト不能 | 純関数分離(wav/silence/pngbytes)+canvas 分離 |
| コード量(実装済 UI) | — | 3パターン UX・声入力・アニメ実装済み |

## 4. 機能・API の現状差分

| 機能 | Next(本番) | Vue(preview) |
|---|---|---|
| Hono API/D1/R2/proxy | あり | あり(**最新版**: 管理者削除=ADMIN_TOKEN 対応は Vue 側のみ) |
| 録音→投稿→再生 | あり(**デコードバグあり N7**: alpha混入で実録音は再生不能) | あり(**修正済み**) |
| 削除(本人) | API のみ | API のみ(UI は T2) |
| 管理者削除 | なし | API あり(要 ADMIN_TOKEN) |
| 音声デコード互換 | — | 既存 PNG と配置互換(旧データも再生可) |

## 5. 運用

| 観点 | Next | Vue |
|---|---|---|
| CF Pages 構成 | out + functions | dist + functions(同一方式) |
| ロールバック | (現役) | 切替後も Next 残置で再 deploy 可 |
| 罠 | peer conflict / AGENTS 生成 | 現状特になし |

## 6. 結論

- Vue は本アプリの要件(静的 SPA・voice-first・テスト先行)に合致し、**サイズ・テスト・デコード健全性で Next を上回る**
- Next に残る優位(SSR 等)は本プロダクトで使わない
- → ADR-001 の妥当性を再確認。**D2(本番切替)はリスク低と判断**

## 7. 関連

- `docs/adr.md` ADR-001 / `docs/decision-options.md` D2 / issue: V4
