# Voice BBS Web — 技術スタック(実装済み実態)

> 設計構想は `docs/spec.md`、課題管理は `issues/` を参照。本ドキュメントは**現時点の実装・運用実態**を記録する。

## 1. 技術スタック

| 層 | 技術 | 実装状況 |
|---|---|---|
| フロント | Next.js 15 (App Router) + React 19, Tailwind CSS v4, **static export** (`output: 'export'` → `out/`) | 実装済み |
| API | Hono 4 on Cloudflare Pages Functions (`functions/api/[[route]].ts`, basePath `/api`) | 実装済み |
| DB | Cloudflare D1 (SQLite) + FTS5 (unicode61) | 実装済み |
| Storage | Cloudflare R2 (bucket `vonsaiapps`) — 音声PNG保存 | 実装済み |
| 音声 | クライアント完結(MediaRecorder / Web Audio API / canvas) — サーバー負荷ゼロ | 実装済み |
| リアルタイム | (spec.md では SSE/ポーリング構想) | **未実装** |
| TTS seed / PWA / 管理者削除 等 | — | 未実装 (`issues/`) |

### バインディング (`apps/web/wrangler.toml`)
- `DB` — D1 `voice-bbs-db`
- `BUCKET` — R2 `vonsaiapps`
- `R2_PUBLIC_URL` — 旧方式の残骸で**コード上は未使用**(v1 で絶対URL保存していたが廃止)

## 2. アーキテクチャ / データフロー

### 録音 → 保存
```
getUserMedia → MediaRecorder (webm/opus 32kbps)
→ decodeAudioData → WAV (16bit PCM mono) → 無音トリム
→ バイト列を RGB PNG に埋め込み (先頭4バイト = データ長 BE)
→ POST /api/threads/:id/posts (image_base64)
→ R2 put posts/{uuid}.png
→ DB posts に audio_url = /api/audio/{uuid}.png (相対パス) を保存
```

### 再生(同一オリジン経由)
```
GET /api/audio/:key  (Pages Function)
→ BUCKET.get('posts/'+key) → image/png を stream 返却
→ fetch は同一オリジン (CORS 不要)
→ createImageBitmap → getImageData → バイト復元 → decodeAudioData → AudioContext 再生
```

**設計判断**: 保存URLは相対パス + Function 経由で配信する。理由は §5「既知の罠」の r2.dev CORS 不可のため。

### DB スキーマ
- `categories` (seed 4件: want / search / trouble / motetai)
- `threads`, `posts`
- `search_index` + `search_index_fts` (FTS5, unicode61) — トリガで同期
- レート制限: device_id あたり本日 4 件 (threads + posts 合算)

## 3. ディレクトリ構成 (apps/web)

```
apps/web/
├── src/
│   ├── app/                 # Next.js App Router (static)
│   ├── components/          # BubbleField / CategoryTabs / Recorder / ThreadModal
│   ├── hooks/               # useAudioRecorder / useAudioPlayer
│   └── lib/                 # audioCodec.ts (PNG⇔WAV) / api.ts
├── functions/api/[[route]].ts   # Hono 全API (Pages Functions)
├── migrations/              # 0001_init.sql / 0002_fts_unicode.sql
├── wrangler.toml
├── next.config.ts           # output:'export'
└── package.json
```

## 4. デプロイ手順 (実測済み: 2026-09-03)

```bash
cd apps/web
npm install --legacy-peer-deps   # §5-2 参照
npm run build                    # out/ 生成

# 初回のみ
npx wrangler d1 create voice-bbs-db   # → database_id を wrangler.toml に反映
# migrations 適用 (D1 API の /raw でも可)
npx wrangler d1 migrations apply voice-bbs-db --remote

# deploy (functions/ も自動バンドル)
npx wrangler pages deploy out --project-name voice-bbs-web
```

認証: `CLOUDFLARE_API_TOKEN` 環境変数、または `wrangler login` (OAuth)。

実環境リソース (account `290e65605de6f2b8a5f61dbfaa36e28c`):
- Pages: `voice-bbs-web` → https://voice-bbs-web.pages.dev
- D1: `voice-bbs-db` (`f5e17b02-92d5-4be8-b7f3-c633d3a922c5`)
- R2: `vonsaiapps` (r2.dev公開URLは発行済みだが**使用していない**)

## 5. 既知の罠

1. **r2.dev 公開URLは CORS ヘッダを返さない** → ブラウザからの fetch が必ずブロックされる。bucket CORS 設定も r2.dev には適用されない(実測)。**同一オリジンの Function プロキシ配信が必須**。カスタムドメインは account に zone が無いため不可。
2. **`npm install` が peer conflict で失敗する** — 未使用の `@cloudflare/next-on-pages` (devDeps) が `@cloudflare/workers-types@^5` と衝突。現状 `--legacy-peer-deps` 必須。CF の Git 連携ビルドも同様に失敗する見込み。→ 解決には未使用 dep の削除が必要。
3. **WSL から Windows 側の global wrangler を叩くと workerd 非互換でクラッシュ**。`node_modules/.bin/wrangler` (Linux) を使う。
4. **wrangler OAuth refresh token は使い捨て(ローテーション)**。使い回すと `invalid_grant`。詰まったら `CLOUDFLARE_API_TOKEN` に切替。
5. `out/` は `.gitignore` 済みのビルド成果物。Functions の変更のみでも `wrangler pages deploy out` で再デプロイ可。
6. 古い絶対URL(`pub-*.r2.dev/...`)の既存レコードは再生不可(プロキシ移行前データ)。マイグレーション時は書き換え/削除が必要。

## 6. 開発基盤の現状

- lint: ESLint (`npm run lint`) — 設定あり
- typecheck: script 未定義 (`npx tsc --noEmit` 相当は手動)
- **test: 未導入** (vitest 等なし)
- **CI/CD: 未導入** (GitHub Actions なし) — `issues/13.md` で Git 連携 hands-off 案を検討中
