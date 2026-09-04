# Voice BBS Web — デプロイ / 運用 (Cloudflare)

> 実装・アーキテクチャの実態は `docs/STACK.md`。ここでは deploy 運用に必要な手順・リソース・罠を集約する。実績: 2026-09-03 本番稼働。

## 1. 認証

- `wrangler login`(OAuth)または **`CLOUDFLARE_API_TOKEN`** 環境変数
- API Token 権限(実績): Account で Workers Scripts / Pages / D1 / R2 の **Edit**
- 罠: wrangler OAuth の refresh token は**使い捨て(ローテーション)**。詰まったら `CLOUDFLARE_API_TOKEN` に切替

## 2. デプロイ手順(手動・実測済み)

```bash
cd apps/web-next
npm install --legacy-peer-deps   # §4-2 参照(解消されるまで)
npm run build                    # out/ 生成(static export)

# migration(初回 & スキーマ変更時のみ)
npx wrangler d1 migrations apply voice-bbs-db --remote

# deploy(out/ + functions/ を自動バンドル)
npx wrangler pages deploy out --project-name voice-bbs-web
```

- `out/` は `.gitignore` 済みのビルド成果物
- Functions のみの変更でも上記 deploy で反映される
- 検証: `curl https://voice-bbs-web.pages.dev/api/healthz` ほか `/api/categories` で D1 接続確認

## 3. 初回構築・実環境リソース

Account: `290e65605de6f2b8a5f61dbfaa36e28c`(Onsen.bonsai@gmail.com's Account)

| リソース | 名前 | ID / URL |
|---|---|---|
| Pages | `voice-bbs-web` | https://voice-bbs-web.pages.dev |
| D1 | `voice-bbs-db` | `f5e17b02-92d5-4be8-b7f3-c633d3a922c5` |
| R2 | `vonsaiapps` | S3エンドポイント: `https://290e65605de6f2b8a5f61dbfaa36e28c.r2.cloudflarestorage.com/vonsaiapps` |

初回構築:
1. `wrangler d1 create voice-bbs-db` → `database_id` を `apps/web-next/wrangler.toml` に反映
2. R2 bucket 作成 + `wrangler.toml` の `bucket_name` を実 bucket 名に合わせる(**R2 は bucket リネーム不可**)
3. migration apply(上記)
4. Pages project 作成(`wrangler pages project create voice-bbs-web` または Dashboard)

> 旧方式では r2.dev 公開URL(`R2_PUBLIC_URL`)が必要だったが、現在の保存URLは相対パス+同一オリジンプロキシのため **R2 の公開設定は不要**。

## 4. 運用上の罠

1. **r2.dev 公開URLは CORS ヘッダを返さない** — ブラウザ fetch は必ずブロック。bucket CORS 設定も r2.dev には適用されない(実測)。→ 同一オリジンの Pages Function プロキシ(`/api/audio/:key`)で配信する設計に変更済み。カスタムドメインは account に zone が無いため不可。
2. **`npm install` が peer conflict で失敗** — 未使用の `@cloudflare/next-on-pages`(devDeps)が `@cloudflare/workers-types@^5` と衝突。現状 `--legacy-peer-deps` 必須。CF Git 連携ビルドも同様に失敗する見込み(`docs/issue.md` N4)。→ 解消には未使用 dep の削除。
3. **WSL から Windows 側の global wrangler を叩くと workerd 非互換でクラッシュ** — `node_modules/.bin/wrangler`(Linux)を使う。
4. **wrangler OAuth refresh token は使い捨て** — 使い回すと `invalid_grant`。
5. **プロキシ移行前の絶対URLデータは再生不可** — 古い `pub-*.r2.dev/...` レコードは DB / R2 両方から削除済み(2026-09-03)。再発時は同様に掃除。

## 5. 自動化(未設定)

- Pages Git 連携 / GitHub Actions: `docs/issue.md` のデプロイ戦略節と N5 参照。N4(peer conflict)解消が前提。
