# Voice BBS Web — デザインシステム方針(検討中)

> 目的: 「声の部屋」のデザイン要素を整理し、軽量なデザインシステムを導入する。タッチ・音声ファースト・PWA。
> 関連: `docs/ux.md`(UX採点) / research/screenshots(参考: dark/glass/voice-chat) / DESIGN_MEETING。

## 1. デザイン要素(現在の実装から抽出)

| 要素 | 現状 | 検討余地 |
|---|---|---|
| 色 | slate-950 基調 + カテゴリ4色(want/search/trouble/motetai) | アクセント・ブランド色の定義。泡の発光色 |
| 泡(bubble) | PNG波形+縁取り+box-shadow。float/bubble-in | ガラス化(P1)。サイズ=長さ(56→160px) |
| タイポグラフィ | system-ui + サイズ変数 | 日本語表示優先。見出し/本文のスケール |
| モーション | float(6-14s)/card-in/bubble-in/title-in | 録音アーム、削除、モード切替のトランジション |
| 録音UI | A/B/C パターン(未採点) | D1 決定後に確定 |
| 余白/タッチ | 44px 最小タップ / セーフエリア対応中 | spacing トークン化 |
| 音響 | タップ音(sfx.ts) | UI トーンの体系化(音量・用途) |

## 2. デザインシステム導入方針(選択肢)

| 案 | 内容 | 向き | 判断 |
|---|---|---|---|
| **a) 自前トークン + Tailwind v4 @theme(推奨)** | CSS 変数で color/space/radius/motion/sfx を一元化。Vuetify 等の重い UI ライブラリは入れない | 泡・音声という独自表現が主役。バンドル最小 | 推奨 |
| b) shadcn-vue 等の部品群 | 標準コンポーネント(シート/ボタン)を流用 | 汎用UI が多い場合 | 本製品では不要寄り |
| c) Vuetify | 即戦力だが重い・デザイン自由度低 | 管理画面等を後で作る場合のみ | 非推奨 |

**推奨: a) 自前トークン**。理由: 独自の「泡/空間/音」表現が中心で、外部 UI キットはバンドルと表現自由度の両面で不利。glass 表現の参考は research/screenshots。

## 3. トークン構成案(実装は次ステップ)

```
theme (Tailwind v4 @theme):
  --color-bg / --color-surface / --color-border
  --color-accent / --color-cat-want|search|trouble|motetai
  --color-bubble-glow / --color-owner (amber)
  --radius-bubble / --radius-sheet
  --space-*
  --anim-float / --anim-in / --anim-arm
  sfx: pop/start/success/error (volume 統一)
コンポーネント: Bubble / RecorderControl / Sheet / CategoryChip
```

## 4. 決定待ち

- [x] **D5: a) 自前トークン + Tailwind v4 @theme を採用**(2026-09-04)。トークン v1 を `apps/web-vue/src/style.css` に実装
- [ ] 泡ガラス化の要否(D3 / R2)
- [ ] ブランドカラーの確定(現在はカテゴリ色のみ)
- [ ] 既存コンポーネントのトークン化適用(T-DS1: Bubble/Sheet 等を semantic class へ)
