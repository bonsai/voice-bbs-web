# archive/stack-2026-09 — スタック比較ドラフト置き場

2026-10-07 のスタック整理 (`docs/STACK.md` を正本に一本化) で退役した重複ドラフト。

## なぜ退役したか

- 12本がほぼ同一結論 (Vue継続 / Next残置 / ReactはPoCで実測) のコピペで、どれが正か分からない状態だった
- 「React未導入」と書いてあるが、2026-09 以降 `apps/web-react` が実装・`voice-bbs-web-react` にデプロイ済みで事実と矛盾
- 正本は `docs/STACK.md` (実装実態)、評価モデルは `docs/frontend-stack-comparison.md`、実測値は `docs/compare-next-vue.md` に集約

## 一覧

| ファイル | 内容 |
|---|---|
| STACK_COMPARISON.md / README-stack-comparison.md | 三者比較の別バージョン |
| compare-vue-next-react.md (+summary / +v2 / .bak2) | 同一比較のコピー群 |
| vue-next-react-comparison.md (+20260907 / .issue / compare-issue) | 同一比較のコピー群 |
| frontend-stack-comparison-issue.md / compare-stack.md | issue転記・ポインタ |

参照が必要になったらここから復元する。新規の比較検討は `docs/frontend-stack-comparison.md` に追記し、結論は `docs/adr.md` にADRとして記録する (ドラフトを増やさない)。
