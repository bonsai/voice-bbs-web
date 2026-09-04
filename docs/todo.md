# Voice BBS Web — TODO 設計(ドキュメントベース)

> 更新: 2026-09-04(リモート pull 後キャッチアップ)。根拠は各 issue / doc 番号で追える。
> 凡例: 状態 `[ ]`未 / `[~]`進行 / `[!]`ブロック / `[x]`完了。所有者: 人間=bonsai、エージェント=A。

## A. 意思決定待ち(人間が先に決める → 以降の TODO が動く)

| ID | 内容 | 根拠 | 状態 |
|----|------|------|------|
| D1 | UX パターン A/B/C の実機検証 & 採用(6軸採点) | `docs/ux.md` §6 / issue #15 | [ ] |
| D2 | 本番切替(issue #15)= Vue を `voice-bbs-web` へ、Next 撤去 | recap / deploy.md | [ ] |
| D3 | デザイン会議 #2 の実施(泡ガラス化・UI採用反映) | research/DESIGN_MEETING_2026-09-04.md | [ ] |
| D4 | PWA 採用可否とインストール導線の位置づけ | issue #7 | [ ] |

## B. 実装 TODO(推奨順。D1 決定前に着手可能なものを上に)

| ID | 内容 | 根拠 | 依存 | 状態 |
|----|------|------|------|------|
| T1 | SPA ルーティング整理(`/`・`?room=`・戻る履歴) | issue #1 | — | [ ] |
| T2 | 泡長押し(300ms)→本人削除メニュー(API は既存) | issue #12 | T1 | [ ] |
| T3 | 再生中エフェクト強化(泡拡大+発光) | issue #4 | — | [ ] |
| T4 | エラーメッセージ localize の仕上げ | issue #2 | — | [~] |
| T5 | キャッシュクリア時の挙動修正(`bufferForUrl`) | issue #3 | — | [ ] |
| T6 | アンビエント再生(+空間定位ゲイン) | issue #13 / #5 | — | [ ] |
| T7 | 接続状態オーバーレイ | issue #11 | — | [ ] |
| T8 | ランディング マイクチェック | issue #10 | T1 | [ ] |
| T9 | 古い投稿クリーンアップ(cron/投稿時) | issue #9 | — | [ ] |
| T10 | PWA 化(manifest/SW/セーフエリア/install) | issue #7 | D4 | [ ] |
| T11 | iOS 部屋名の声入力代替(STT 設計) | issue #14 / #6 | — | [ ] |

## C. 検証・QA TODO

| ID | 内容 | 根拠 | 状態 |
|----|------|------|------|
| Q1 | 実機(iOS/Android)で録音→投稿→再生・音声認識・install 導線を検証 | ux.md §1(再採点) | [ ] |
| Q2 | preview https://voice-bbs-web-vue.pages.dev の A/B/C 動作再確認(ランダム起動変更後) | recap 09-04 | [ ] |
| Q3 | Next 本番の最終健全性確認(切替直前スナップショット) | deploy.md §3 | [ ] |
| Q4 | TTS seed / 管理者削除(新着コミット)の動作確認と issue 状態の整合 | 09-04 commits / issue #8 #12 | [ ] |

## D. 運用・CI TODO

| ID | 内容 | 根拠 | 状態 |
|----|------|------|------|
| O1 | GitHub Actions(test/typecheck → deploy) | issue N5(旧)・test.md §6 | [ ] |
| O2 | 切替後の単系統 deploy 手順へ `handsoff.md` 更新 | docs/handsoff.md §5 | D2 後 |
| O3 | peer conflict 解消確認(切替後 `npm install` 素直に) | deploy.md §4-2 | D2 後 |
| O4 | トークンコスト実績の記録(plan.md 見積との比較) | docs/plan.md §4 | — |

## E. リサーチ・デザイン TODO

| ID | 内容 | 根拠 | 状態 |
|----|------|------|------|
| R1 | glassmorphism 参考の詳細分析 | DESIGN_MEETING(議題2 アクション) | [ ] |
| R2 | 泡のガラス化プロトタイプ(開発) | 同上 | [ ] |
| R3 | 次回デザイン会議の議題設定(採用UI反映、泡表現) | DESIGN_MEETING_TEMPLATE.md | D3 前 |

## 推奨シーケンス

1. 人間: preview 実機検証 → D1 採点(→ Q1 結果を根拠に)
2. エージェント: T1→T2(UI 骨格仕上げ)。D1 と独立して進行可
3. D1 確定 → spec/PRD 反映 → D2 本番切替 → O2/O3
4. 並行: R1/R2(デザイン)、Q4(新着機能整合)
5. その後 PWA(T10/O1 CI を D4 と共に)
