# Voice BBS Web — 設計書

## 概要
匿名・認証不要の音声掲示板。誰でも声で書き込み、シャボン玉のようにふわふわ浮かぶ UI でスレッドを可視化。Cloudflare インフラのみで完結。

## 技術スタック

| 層 | 技術 | 理由 |
|---|---|---|
| フロント | Next.js 15 (App Router) → static export | React, Tailwind, 開発速度。Cloudflare Pages へ deploy |
| API | Hono on Cloudflare Pages Functions | 軽量、型安全、同じリポジトリでエッジ展開 |
| DB | Cloudflare D1 (SQLite) | 無料 5GB, FTS5 全文検索対応 |
| Storage | Cloudflare R2 (S3互換) | 音声 PNG 保存。無料 10GB/月、転送無料 |
| リアルタイム | EventSource (SSE) or ポーリング | WebSocket 不要で配信 |
| 音声処理 | クライアント完結 (Web Audio API, MediaRecorder) | サーバー負荷ゼロ、無料 |

## ディレクトリ構成

```
voice-bbs-web/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx          # トップ (Bubble一覧 + Threadモーダル)
│       │   │   └── layout.tsx
│       │   ├── components/
│       │   │   ├── BubbleField.tsx   # ふわふわ浮遊フィールド
│       │   │   ├── ThreadModal.tsx   # Thread 詳細 / Auto Player
│       │   │   ├── Recorder.tsx      # 長押し録音 UI
│       │   │   └── CategoryTabs.tsx
│       │   ├── hooks/
│       │   │   ├── useAudioRecorder.ts  # 録音+PNGエンコード
│       │   │   └── useAudioPlayer.ts    # 連続再生キュー
│       │   └── lib/
│       │       ├── audioCodec.ts     # encodeBytesAsPNG / decodePNGToWav
│       │       └── api.ts            # fetch ラッパー
│       ├── functions/
│       │   └── api/
│       │       └── [[route]].ts      # Hono Cloudflare Pages Functions
│       ├── migrations/
│       │   └── 0001_init.sql         # D1 schema
│       ├── public/
│       ├── wrangler.toml
│       └── package.json
├── docs/
│   └── spec.md
└── issues/
    └── ISSUES.md
```

Next.js は**単一ページ SPA** として動作。Thread 詳細は `?thread=xxx` クエリでモーダル表示し、直接リンク共有も可能。

## データモデル (D1 SQLite)

```sql
-- コンペカテゴリ
CREATE TABLE categories (
  id    TEXT PRIMARY KEY,
  name  TEXT NOT NULL,
  color TEXT NOT NULL
);

-- スレッド = シャボン玉
CREATE TABLE threads (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  category_id TEXT NOT NULL REFERENCES categories(id),
  title       TEXT,
  device_id   TEXT NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 音声投稿
CREATE TABLE posts (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  thread_id   TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  device_id   TEXT NOT NULL,
  audio_url   TEXT NOT NULL,     -- R2 public URL
  duration    REAL NOT NULL,
  content     TEXT,              -- STTテキスト / 要約 / seed本文
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 全文検索インデックス
CREATE TABLE search_index (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id TEXT,
  post_id   TEXT,
  content   TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE VIRTUAL TABLE search_index_fts USING fts5(
  content,
  content_rowid=id,
  content=search_index
);

CREATE INDEX idx_posts_thread  ON posts(thread_id, created_at);
CREATE INDEX idx_threads_cat   ON threads(category_id, created_at);
CREATE INDEX idx_posts_device  ON posts(device_id, created_at);
```

### FTS5 トリガー（同期）
```sql
CREATE TRIGGER search_index_insert AFTER INSERT ON posts BEGIN
  INSERT INTO search_index(thread_id, post_id, content) VALUES (NEW.thread_id, NEW.id, NEW.content);
END;

CREATE TRIGGER search_index_delete AFTER DELETE ON posts BEGIN
  DELETE FROM search_index WHERE post_id = OLD.id;
END;
```
*上記は migration 内で定義*

## API (Hono)

| Method | Path | 説明 |
|---|---|---|
| GET | `/api/healthz` | ok |
| GET | `/api/categories` | カテゴリ一覧 |
| GET | `/api/threads?category=&q=&limit=50` | Thread 一覧。`q` で FTS5 検索 |
| POST | `/api/threads` | Thread 作成 `{category_id, title?, device_id}` |
| GET | `/api/threads/:id/posts` | Post 一覧（時間順） |
| POST | `/api/threads/:id/posts` | 投稿 `{image_base64, duration, device_id, content?}` |
| DELETE | `/api/posts/:id?device_id=` | 削除（同 device_id のみ） |
| GET | `/api/count/:device_id` | 本日の投稿数 + 残りスロット |

### レート制限
- device_id あたり **本日スレッド+Post 合計 4件**。
- 判定: `COUNT(*) FROM (SELECT 1 FROM threads WHERE device_id=? AND created_at>=unixepoch('now','start of day') UNION ALL SELECT 1 FROM posts WHERE device_id=? AND created_at>=unixepoch('now','start of day'))`

### R2 Upload
- POST body `image_base64` → Buffer.from(base64, 'base64') → `env.BUCKET.put(key, buffer, {httpMetadata: {contentType: 'image/png'}})`
- public URL: `https://pub-r2.${account}.dev/${key}` （バケット設定による）

## クライアント音声フロー

### Record → Upload
1. MediaRecorder (opus/webm) 録音
2. `decodeAudioData` → WAV + 無音トリム（既存ロジック移植）
3. `encodeBytesAsPNG(wavBytes)` → base64
4. 任意: Web Speech API で `content`（テキスト）を生成
5. POST `/api/threads/:id/posts` (`{image_base64, duration, content?}`)

### Play (Thread モーダル)
1. `/api/threads/:id/posts` で一覧取得
2. 各 `audio_url` から PNG fetch
3. `decodePNGToWav` → AudioBuffer → キュー再生
4. **Auto Play**: 1件終わったら次を自動再生

### decodePNGToWav
```ts
async function decodePNGToWav(url: string): Promise<{ buffer: AudioBuffer; duration: number }> {
  const res = await fetch(url);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  const imgData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  const len = new DataView(imgData.data.buffer).getUint32(0, false);
  const wavBytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    wavBytes[i] = imgData.data[4 + i];
  }
  const audioCtx = new AudioContext();
  const audioBuf = await audioCtx.decodeAudioData(wavBytes.buffer.slice(0));
  return { buffer: audioBuf, duration: audioBuf.duration };
}
```
*PNG alpha channel (255) を飛ばし、連続したRGBA配列から先頭4byteを長さ、以降をデータとして復元。*

## UI 仕様

### Top Page (`/`)
- **背景**: 暗いグラデ（slate-950）
- **カテゴリタブ**: 上部に横並び（want / search / trouble / motetai）
- **BubbleField**:
  - Thread 1件 = シャボン玉（円）。
  - サイズ: `56 + min(totalDuration/30,1)*104` px
  - position: absolute, random x/y。CSS `@keyframes float` で上下 + 左右に漂う。
  - edgeでbounce（JS measurement or CSS contained animation）
  - カテゴリ color を border / shadow に反映。
- **Ambient Audio**:
  - 全 Thread の最新 Post を低音量・低品質で再生（Web Audio PannerNode）。
  - 画面中央に近いものほど volume up。
  - 長押し or タップで Thread モーダルオープン + 該当 Post を full volume で再生。

### Thread Modal (`?thread=xxx`)
- オーバーレイ: backdrop-blur + dark overlay
- Thread title + category chip
- Post Bubble list（縦）：アバターなし声アイコン + 再生状態
- **Auto Play**: 開いたら先頭から自動再生。完了で次へ。
- **新規録音**: 下部に長押し Recorder ボタン（既存 UX と同じ）

### Recorder Component
- ボタン: hold to record（長押し中 recording クラス）
- タイマー + 波形 canvas (Web Audio Analyser)
- 無音トリム後、バブルプレビュー表示
- スロット UI: 4 ドット（device_id あたりの本日残数）

## TTS Seed（サンプル投稿）

1. デプロイ後、ブラウザから `/admin/seed`（簡易パスワード保護）にアクセス
2. Web Speech API で各カテゴリの seed テキストを合成 → WAV → PNG エンコード
3. クライアントから `/api/threads` & `/api/threads/:id/posts` にPOSTして保存

Seed テキスト例:
- want: 「駅前に無料の足湯があるカフェがほしい」
- search: 「赤い革靴 24.5cm を探しています」
- trouble: 「隣人のゴミ置き場で困っています」
- motetai: 「髪型を変えてモテたいです、アドバイスほしい」

## デプロイ構成

### Cloudflare Pages
- **Build command**: `cd apps/web && next build` （static export）
- **Output directory**: `apps/web/out` （Next.js static export デフォルトは `out`）。`distDir: 'out'` に設定
- **Functions directory**: `apps/web/functions`
- **R2 binding**: `BUCKET`
- **D1 binding**: `DB`

### wrangler.toml (apps/web)
```toml
name = "voice-bbs-web"
pages_build_output_dir = "out"

[[d1_databases]]
binding = "DB"
database_name = "voice-bbs-db"
database_id = "<your-database-id>"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "voice-bbs-audio"
```

### 環境変数
| 変数 | 用途 |
|---|---|
| `R2_PUBLIC_URL` | seed script / API response に R2 オブジェクト公開 URL の prefix を組み立てる |

## 実装ステップ

1. D1 schema & migration (`wrangler d1 migrations create`)
2. Hono API scaffold (`functions/api/[[route]].ts`) + R2 upload
3. Next.js static export config + Tailwind v4 setup
4. client: `audioCodec.ts` (encode/decode PNG)
5. client: `useAudioRecorder.ts` (MediaRecorder + trim + encode)
6. client: `BubbleField.tsx` (float animation + ambient audio)
7. client: `ThreadModal.tsx` + `useAudioPlayer.ts` (auto play queue)
8. client: `Recorder.tsx` + rate-limit slots
9. Seed script (browser console or admin page)
10. `wrangler pages deploy` or Git 連携

## 無料枠まとめ

| サービス | 無料枠 | 想定使用量 |
|---|---|---|
| Cloudflare Pages | 無制限リクエスト、1ビルド/分 | 問題なし |
| D1 | 5GB, 25万行読出/日, 5万行書込/日 | 音声メタデータのみで圧倒的に余裕 |
| R2 | 10GB, 転送無料 | 1分音声=~300KB。1万投稿=3GB |
| Workers / Pages Functions | 100,000 req/日 | 問題なし |
