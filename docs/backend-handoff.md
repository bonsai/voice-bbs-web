# Voice BBS Web — バックエンド委譲メモ(別担当へ)

> 方針: フロント(web-vue)とデザインを主線とする。バックエンド系タスクは**別担当**へ委譲するため、スコープ・前提・受領条件を整理する。
> 前提資料: `docs/deploy.md`(リソース/罠)/ `docs/handsoff.md`(運用)/ `docs/issue.md`(状態)/ `AGENTS.md`(規約)

## 1. 委譲対象(バックエンド/基盤系)

| 対象 | 内容 | 依存/注意 | 状態 |
|---|---|---|---|
| BE1 | 管理者削除の `ADMIN_TOKEN` 設定と検証 | env secret。フロントは API 済み | [ ] |
| BE2 | 古い投稿自動クリーンアップ(CF Cron or 投稿時) | 保存形式(PNG/R2)との整合 | [ ] |
| BE3 | TTS seed の動作確認と issue 状態の整合 | scripts(09-04 追加分) | [ ] |
| BE4 | CI: GitHub Actions(test/typecheck→deploy) | 両プロジェクト / O1 | [ ] |
| BE5 | D1/R2 運用(スキーマ変更時 migration・データ整合) | deploy.md §2 | [ ] |
| BE6 | peer conflict(web-next)の扱い確定 | 残置方針で放置可・明示 | [ ] |
| BE7 | API 変更時の web-vue functions 同期 | 現状 web-vue が最新 | [ ] |

## 2. フロント側が引き続き持つ範囲

- デザインシステム・UI/UX(3パターン採点含む)
- 音声コーデック(純関数)・録音/再生ロジック
- SPA ルーティング・PWA フロント面

## 3. 受領条件(別担当が着手するとき)

- `docs/issue.md` の対象行を自分に assign し、状態を更新
- API は `apps/web-vue/functions` を変更し、`apps/web-next` は触らない(残置方針)
- 変更はテスト(vitest)+typecheck+build を緑にして commit
- 本番反映は preview → 承認 → 本番(`docs/handsoff.md` 参照)

## 4. 連絡事項

- バックエンド対象は上記 BE1〜BE7。フロントと交差するのは BE1(削除UIは済)のみ
- 判断が必要な項目は `docs/decision-options.md` に記載してから着手
