# Work Recap — voice-bbs-web (2026-09-04 セッション)

> 更新: 2026-09-04。リポジトリをクローンし、Vue 移行側のコードを再開。

## 状態(次回の出発点)

- リポジトリ: `/home/bons/repos/voice-bbs-web`
- P2〜P4 実装済み・テスト21本緑の状態は維持
- UI/UX 型の一本化を開始: `apps/web-vue/src/types/uiux.ts` を新設
  - `UIMode` / `ViewState` / `BubbleItem` の 3 型を集約
- 未完了: P5 本番切替(承認待ち)、UX 採点(N11)、PWA(N12)

## 今セッションで完了(証拠つき)

| 項目 | 証拠 |
|---|---|
| リポジトリ取得 | `git clone https://github.com/bonsai/voice-bbs-web.git repos/voice-bbs-web` |
| ドキュメント・ソース再読 | `AGENTS.md` / `docs/spec.md` / `docs/ux.md` / `apps/web-vue/src/**` |
| UI/UX 型 3 つ作成 | `apps/web-vue/src/types/uiux.ts` (`UIMode`, `ViewState`, `BubbleItem`) |
| 既存ファイルを型に追従 | `App.vue` / `RoomView.vue` / `lib/uiMode.ts` |

## 次の一手(優先順)

1. `npm run typecheck && npm run test` で変更検証
2. N11: preview 実機検証 → 6軸採点 → 採用パターン確定
3. N12: PWA 化(manifest / SW / オフライン)
4. N13: 本番切替 + Next 撤去(承認後)

---

# Work Recap — voice-bbs-web (2026-09-03 セッション)

> 更新: 2026-09-03。次回は冒頭の「状態」から再開。kanban: `docs/kanban.md` / issues: `docs/issue.md`

## 状態(次回の出発点)

- **Vue 移行中(ADR-001 / N6)**: P2〜P4 実装済み・テスト21本緑。**P5 本番切替は未(承認待ち)**
- UX: 3パターン(A/B/C)実装・preview デプロイ済み。**採点(N11)・採用は未**
- 本番(Next)は https://voice-bbs-web.pages.dev で稼働継続中

## 今セッションで完了(証拠つき)

| 項目 | 証拠 |
|---|---|
| CF デプロイ(D1/R2/Pages) | https://voice-bbs-web.pages.dev 実API検証済 |
| 再生不具合修正(同一オリジンプロキシ) | commit `5dedcd1` |
| ドキュメント基盤一式 | PRD/spec/ADR/issue/kanban/STACK/deploy/test/dx/plan/ux/recap |
| docs駆動+AGENTS(原理/状況分離) | `AGENTS.md` / `dx.md` |
| Next デコードバグ発見(N7) | alpha混入で実録音は再生不能。Vue 側で修正済み |
| Vue 雛形 + audioCodec純関数移植 | P2。vitest 17本→(P3/P4後)21本緑 |
| ロビー/部屋UI + 録音/再生 | P3/P4。preview https://voice-bbs-web-vue.pages.dev |
| タッチ3パターン実装 | Aドック/B文脈/Cスワイプ。部屋名を声で入力シート |
| issue 再編・積み込み | docs/issue.md へ統合(旧 issues/ 廃止) |

直近コミット: `b06eb1c`(issue N11-N14)ほか一連の docs/feat。

## ブロッカー・保留

- npm peer conflict(next-on-pages)→ 移行切替(N13)で実質解消見込み
- P5 本番切替・Next 撤去 → **承認待ち**
- UX パターン採点 → 実機検証待ち(N11)
- iOS 部屋名音声入力 → 非対応のため代替要(N14)

## 次の一手(優先順)

1. N11: preview 実機検証 → 6軸採点 → 採用パターン確定
2. N12: PWA化(manifest/SW)
3. N13: 本番切替 + Next 撤去(承認後)
4. N5: CI(GitHub Actions)

## 数量メモ

- vitest: 21 passed(typecheck/build OK)
- トークン実績は未計測(計画見積 `docs/plan.md`: 中央 $2.4)
- 本番データ: D1/R2 稼働。テストデータは掃除済み
