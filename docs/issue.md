# Issues — voice-bbs-web

> 更新: 2026-09-03。**新しいイシューを上に、古いものを下に**。状態: `[x]`完了 / `[~]`進行・部分 / `[ ]`未着手 / `[!]`ブロック
> 進捗: `docs/kanban.md` / テスト方針: `docs/test.md` / 実装実態: `docs/STACK.md` / 要求: `docs/PRD.md`
> (旧 `issues/` ディレクトリの ISSUES.md / 13.md を統合し、issues/ は廃止: 2026-09-03)

---

## 新規イシュー(上・新しい順)

| # | 優先度 | タイトル | 状態 | 備考 |
|---|--------|----------|------|------|
| N14 | P1 | iOS の部屋名「声で入力」代替策 | [ ] | iOS Safari は SpeechRecognition 非対応。録音→STT か入力UI主体か要検討 |
| N13 | P0 | 本番切替 P5 + Next(apps/web)撤去 | [ ] | UX 採点・実機確認後に実行(本番変更のため承認必要)。切替で N4(peer conflict)・N7 も実質解消 |
| N12 | P0 | PWA 化(manifest/icons/SW・オフライン) + 実機最適化 | [ ] | 採用パターン確定後に着手。セーフエリア・インストール導線含む |
| N11 | P1 | UX パターン採点・採用確定(A/B/C×6軸) | [ ] | 3案実装済み・preview: https://voice-bbs-web-vue.pages.dev(ロビー右上で切替)。実機検証→`docs/ux.md`採点→採用 |
| N8 | P1 | モバイルPWA向け UX/UI 検討(複数パターン×6軸採点) | [~] | 採点基準策定済み(`docs/ux.md`)。3パターン(A下部ドック/B文脈タップ/Cスワイプ)実装済み → N11 で採点・確定 |
| N7 | P0 | Next 実装の音声デコードバグ修正 | [x] | 発見: デコーダが alpha を長さに混入(実録音は再生不能だった)。Vue 側 `pngbytes.ts` で修正実装 + 往復テスト17本緑。既存PNGとは配置互換のため旧データも再生可 |
| N6 | P0 | Next.js → Vue 移行 (ADR-001) | [~] | P2〜P4 実装済み: audioCodec純関数 + ロビー/部屋UI + 録音/再生。テスト21本緑。preview: https://voice-bbs-web-vue.pages.dev(本番D1/R2接続確認済)。P5切替・P6 CIは未。`docs/plan.md` 参照 |
| N5 | P0 | vitest テスト基盤導入 + CI (GitHub Actions) | [!] | ビルド依存の衝突(N1)がブロッカー。`docs/test.md` 参照 |
| N4 | P0 | ビルド依存の衝突解消 | [!] | 未使用 `@cloudflare/next-on-pages` × `workers-types@^5` → plain `npm install` が ERESOLVE。→ next-on-pages 削除 or 解決 |
| N3 | P1 | 投稿者本人削除の UI 化 | [~] | 旧#8。API(`DELETE /api/posts/:id`)実装済み・UI 未接続 |
| N2 | P1 | 既存 r2.dev 直URLデータの掃除 | [x] | プロキシ移行前に投稿された古い絶対URLは再生不可 → DB/R2 から削除済み(2026-09-03) |
| N1 | P0 | 音声再生の同一オリジンプロキシ化 | [x] | r2.dev CORS 不可 → Pages Function `/api/audio/:key` で配信。commit `5dedcd1` |

## デプロイ戦略(旧 issue #13 統合)

**状態: [~]** 手動 deploy で本番稼働中(https://voice-bbs-web.pages.dev)。自動化は N5 完了後。

| 方式 | 概要 | 状態 |
|---|---|---|
| 手動 deploy | `wrangler pages deploy out --project-name voice-bbs-web`(+ D1 migration) | [x] 実績あり・本番適用済み |
| Pages Git 連携 | CF Dashboard から repo 接続、push で自動 build/deploy | [ ] 未設定。**N4 解消までビルド失敗する見込み** |
| GitHub Actions | `cloudflare/pages-action` で deploy | [ ] 未設定(→ N5 の CI 整備と合わせて検討) |

実績メモ(2026-09-03):
- Pages `voice-bbs-web` / D1 `voice-bbs-db` / R2 `vonsaiapps` で稼働
- 認証は `CLOUDFLARE_API_TOKEN`(Workers Scripts / Pages / D1 / R2 の Edit)または OAuth
- 詳細・罠: `docs/deploy.md`

---

## 旧イシュー(下・再構築当初から整理)

### P0

| # | タイトル | 状態 | 備考 |
|---|----------|------|------|
| 6 | TTS サンプル seed | [ ] | Web Speech API。テキストseed済み |
| 5 | PNGデコード & 自動連続再生プレイヤー | [x] | プロキシ配信(N1)に適合済み |
| 4 | Thread / Post API + R2 upload | [x] | 匿名・レート制限(4件/日/device) |
| 3 | 音声録音 Hook (無音トリム・PNG encode) | [x] | useAudioRecorder。旧ISSUES.mdの完了表に記載漏れあり |
| 2 | シャボン玉 UI & float アニメ | [x] | — |
| 1 | Next.js + Hono + CF Pages scaffold & D1/R2 | [x] | — |

### P1

| # | タイトル | 状態 | 備考 |
|---|----------|------|------|
| 12 | DB テキスト検索 | [~] | API LIKE + FTS5(unicode61)整備済み。UI利用は要確認 |
| 11 | ランディング マイクチェック | [ ] | オンボーディング |
| 10 | 接続状態オーバーレイ | [ ] | 切断時グレースケール。手段は Realtime/ポーリング要検討 |
| 9 | 古い投稿自動クリーンアップ | [ ] | cron or 投稿時 n 件保持 |
| 8 | 投稿者本人削除 | [~] | → N3 に引き継ぎ |
| 7 | PWA (manifest / SW / offline) | [ ] | — |

### 完了・確定(記録)

| # | 内容 | 状態/commit |
|---|------|------|
| 14 | OpenAPI 仕様書 | [x] `openapi.yaml`(repo 内) |
| — | デプロイ本番適用 | [x] 2026-09-03 |

### 旧 voice_bbs (Elixir) からの棄却判断

- 旧#8/#9: 認証・カテゴリモデルへ統合(close)
- 旧#10: HEEx固有(close)
- 旧#11: → 新#10 へ継承
- 旧#12: Elixir/shiritori 固有(close)

## ユーザー追加要望(口頭/指示抽出)

- Cloudflare のみで完結 / テキスト保存&検索 → 旧#12
- コンペ形式(カテゴリ)スレッド / シャボン玉・ふわふわ / タップで Thread に入って auto 再生 / TTS サンプル
