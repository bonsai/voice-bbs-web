# Sprint Log — voice-bbs-web(10分会議+10分実装)

> 形式: 1 スプリント = 10 分会議(議事要旨)+ 10 分実装(1 件)。会議詳細は research/DESIGN_MEETING_*。

## Sprint 1 (2026-09-04) — 録音ガイド導入

**会議 10 分(要旨)**
- 会議#2 決定順の 1 件目: 初回録音ガイド 1 枚
- 対象: 初めて部屋に入った時のみ。内容 = モード別の「聞く/吹き込む」操作
- 判断: ガイドは毎回出さない(localStorage で 1 回)。泡空間を隠さない半透明オーバーレイ

**実装 10 分(結果)**
- RoomView に初回ガイドオーバーレイ追加(localStorage `voice_bbs_guide_seen_v1`)
- モード A/B/C に応じて操作文言を切替
- typecheck/test/build 緑 / commit: 下記

**次のスプリント候補**: T-DS1(トークン適用: 泡→シート)
