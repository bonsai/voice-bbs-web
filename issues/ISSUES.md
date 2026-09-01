# Issues v2 — voice-bbs-web

旧 voice_bbs (Elixir) からの知見を活かし、Next.js + Hono + Cloudflare で再構築する上での課題・機能一覧。

## 優先度マップ

| # | 優先度 | タイトル | 元issue | 備考 |
|---|--------|----------|---------|------|
| 1 | P0 | Next.js + Hono + CF Pages scaffold & D1/R2 接続 | - | 技術選定済 |
| 2 | P0 | シャボン玉 UI & ふわふわ float アニメーション | - | コンセプト核 |
| 3 | P0 | 音声録音 Hook (無音トリム・PNGエンコード) | - | 既存JSをTS移植 |
| 4 | P0 | Thread / Post API + R2 Storage upload | 旧#6,旧#9 | 匿名・レート制限 |
| 5 | P0 | PNGデコード & 自動連続再生プレイヤー | - | encodeの逆実装 |
| 6 | P0 | TTSサンプル seed | - | Web Speech API |
| 7 | P1 | PWA (manifest, service worker, offline) | 旧#6 | Web App Manifest |
| 8 | P1 | 投稿者本人削除 | 旧#6 | device_idベース |
| 9 | P1 | 古い投稿自動クリーンアップ | 旧#6 | cron or 投稿時n件保持 |
| 10 | P1 | 接続状態オーバーレイ (切断時グレースケール) | 旧#11 | CF WebSocket/WebTransport?
| 11 | P1 | ランディング マイクチェック | 旧#7 | オンボーディング |
| 12 | P1 | DBテキスト検索 (FTS5) | - | ユーザー要望「検索したい」 |

## 旧issueからの判断・棄却

| 旧# | 判断 | 理由 |
|-----|------|------|
| 6 | 分割 | P0/P1に整理。内容が大きすぎた |
| 7 | 継承(#11) | 新アーキでもランディング体験として必要 |
| 8 | close | Elixir/shiritori固有。再構築ではカテゴリモデルに統合 |
| 9 | close | Elixir/Auth固有。新アーキでは認証不要 |
| 10 | close | Elixir/HEEx固有。新アーキではReact |
| 11 | 継承(#10) | UI/UX。切断検知方法はWebSocket→Realtime or fetchポーリング |
| 12 | close | Elixir/shiritori固有。汎用バリデーションUIは別途考慮可 |

## ユーザーの追加要望（口頭/指示抽出）
- Cloudflare のみで完結
- DBでテキストを保存して検索したい → #12として追加
- コンペ形式（カテゴリ）スレッド
- シャボン玉、ふわふわ、ちょっとずつ聞こえてくる
- タップでThread入ってauto再生
- TTSサンプル
