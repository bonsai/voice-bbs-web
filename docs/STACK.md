# Voice BBS Web — 技術スタック(実装済み実態)

> 設計構想は `docs/spec.md`、課題管理は `docs/issue.md`、**デプロイ/運用は `docs/deploy.md`** を参照。本ドキュメントは**現時点の実装・アーキテクチャ実態**を記録する。

## 1. 技術スタック

| 層 | 技術 | 実装状況 |
|---|---|---|
| フロント | Next.js 15 (App Router) + React 19, Tailwind CSS v4, **static export** (`output: 'export'` → `out/`) | 実装済み |
| API | Hono 4 on Cloudflare Pages Functions (`functions/api/[[route]].ts`, basePath `/api`) | 実装済み |
| DB | Cloudflare D1 (SQLite) + FTS5 (unicode61) | 実装済み |
| Storage | Cloudflare R2 (bucket `vonsaiapps`) — 音声PNG保存 | 実装済み |
| 音声 | クライアント完結(MediaRecorder / Web Audio API / canvas) — サーバー負荷ゼロ | 実装済み |
| リアルタイム | (spec.md では SSE/ポーリング構想) | **未実装** |
| TTS seed / PWA / 管理者削除 等 | — | 未実装 (`docs/issue.md`) |

### バインディング (`apps/web/wrangler.toml`)
- `DB` — D1 `voice-bbs-db`
- `BUCKET` — R2 `vonsaiapps`
- `R2_PUBLIC_URL` — 旧方式の残骸で**コード上は未使用**(絶対URL保存を廃止したため)

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

**設計判断**: 保存URLは相対パス + Function 経由で配信する。理由は `docs/deploy.md` §4-1(r2.dev が CORS 非対応のため)。

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

## 4. 開発基盤の現状

- lint: ESLint (`npm run lint`) — 設定あり
- typecheck: script 未定義 (`npx tsc --noEmit` 相当は手動)
- **test: 未導入** (vitest 等なし) — 方針は `docs/test.md`、導入は `docs/issue.md` N5
- **CI/CD: 未導入** — `docs/issue.md` のデプロイ戦略節に集約

## 5. 運用・デプロイ

→ **`docs/deploy.md`** に分離。認証 / 手順 / 実リソース / 罠 / 自動化方針を参照。
