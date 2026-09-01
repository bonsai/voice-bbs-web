# Voice BBS Web

匿名・認証不要の音声掲示板。シャボン玉に声をのせてふわふわ浮かべる。

## Tech Stack
- **Next.js 15** (App Router) → Cloudflare Pages static export
- **Hono** on Cloudflare Pages Functions
- **Cloudflare D1** (SQLite) + **R2** (audio PNG storage)
- **Web Audio API** client-side codec (WAV ↔ PNG)

## Quick Start
```bash
cd apps/web
npm install

# local dev (D1 + R2 + Functions)
npx wrangler pages dev out --port 8788

# build
npm run build
```

## DB Migration (local)
```bash
npx wrangler d1 migrations apply voice-bbs-db --local
```

## API Test (local)
```bash
curl http://localhost:8788/api/healthz
curl http://localhost:8788/api/categories
```

## Deploy
1. GitHub repo `voice-bbs-web` を作成して push
2. Cloudflare Dashboard → Pages → Git 連携 (`apps/web` ディレクトリ)
3. D1 DB 作成 → `database_id` を `wrangler.toml` に反映
4. R2 bucket `voice-bbs-audio` 作成 → public access
5. `R2_PUBLIC_URL` を `wrangler.toml` の vars に設定
6. Migration apply (`--remote`) → deploy

## Features
- 匿名録音 → 無音トリム → PNG エンコード → R2 アップロード
- スレッド作成 / カテゴリ別閲覧 / テキスト検索
- レート制限（device_id あたり本日 4 件）
- シャボン玉 UI（ふわふわ float animation）
- Thread ページ自動連続再生

## 未実装 (P1)
- TTS seed（テキストのみ seed 済み。音声合成サンプルは別途）
- PWA (service worker)
- 管理者削除・自動クリーンアップ
- 接続状態オーバーレイ
- ランディング マイクチェック
