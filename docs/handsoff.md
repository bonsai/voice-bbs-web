# Voice BBS Web — 手離れ運用ガイド (Hands-off / 人間運用)

> エージェントなしで運用・デプロイするための最短手順。詳細・罠は `docs/deploy.md`。
> 現状: 本番=Next(`apps/web`)、移行先 Vue(`apps/web-vue`)は preview で並行。切替前のため手順が2系統ある。

## 1. 前提・秘密

- wrangler は Linux 版を使う(`apps/web/node_modules/.bin/wrangler`)。Windows 側 global は不可
- 認証: `CLOUDFLARE_API_TOKEN`(権限: Workers Scripts / Pages / D1 / R2 の Edit)
  ```bash
  export CLOUDFLARE_API_TOKEN=xxxxxxxx
  W=apps/web/node_modules/.bin/wrangler
  ```

## 2. よく使うコマンド

```bash
# 本番(Next)を再デプロイする場合
cd apps/web && npm run build
$W d1 migrations apply voice-bbs-db --remote   # スキーマ変更時のみ
$W pages deploy out --project-name voice-bbs-web

# Vue(移行先)を preview へ反映する場合
cd apps/web-vue && npm run test && npm run typecheck && npm run build
$W pages deploy dist --project-name voice-bbs-web-vue --branch main

# 将来 Vue を本番へ切替(承認後)
$W pages deploy dist --project-name voice-bbs-web
```

## 3. 状態確認(30秒ヘルスチェック)

```bash
curl -s https://voice-bbs-web.pages.dev/api/healthz      # 本番API
curl -s https://voice-bbs-web.pages.dev/api/categories    # D1接続確認
curl -s https://voice-bbs-web-vue.pages.dev/api/healthz   # Vue preview API
```

## 4. 日常運用の約束事(人間向け)

- **コード変更 = まず docs**(PRD/spec/issue)。実装後は STACK/kanban/recap を更新
- commit は小分け・日本語 1 行要約。`master` へ直接 push 運用(現状)
- 本番 D1/R2 は共用。テストデータを本番に入れたら掃除する(`docs/deploy.md` §4-5)
- 録音枠は device_id あたり 4 件/日(レート制限で自動防御)

## 5. まだ自動化されていないこと(→ issue)

- UX パターン採点・採用(N11)
- PWA 化(N12)
- **本番切替 P5 + Next 撤去(N13)** — 切替後は上記「よく使うコマンド」が単系統になる
- CI(GitHub Actions: test/typecheck/deploy)(N5)
- npm peer conflict(N4)→ 切替で解消見込み。現状 `npm install` は `--legacy-peer-deps` が必要

## 6. やるべき時系列(いま押さえること)

1. 実機で https://voice-bbs-web-vue.pages.dev を触る(A/B/C 切替)
2. 採用パターンを決める(6軸: `docs/ux.md`)
3. 本番切替の承認 → N13 実行
4. PWA/CI はその後
