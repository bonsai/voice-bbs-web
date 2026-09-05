# gh / アカウント記憶 (gh.agent.md)

> エージェントが gh / git / wrangler を操作するときのアカウント記憶。
> トークン値そのものはここに書かない。場所だけ記す。

## GitHub

- user: `bonsai`
- commit email: `onsen.bonsai@gmail.com` (git config の `bonsai@example.com` はプレースホルダ。commit 時は必ずこちらを使う)
- gh 認証: `~/.config/gh/hosts.yml` (oauth_token あり、user = bonsai)

## Cloudflare

- Account: **Onsen.bonsai@gmail.com's Account** (Account ID `290e65605de6f2b8a5f61dbfaa36e28c`)
- リソース: `docs/deploy.md` §3 (Pages `voice-bbs-web` / D1 `voice-bbs-db` / R2 `vonsaiapps`)
- 認証: `CLOUDFLARE_API_TOKEN`(権限: Workers Scripts / Pages / D1 / R2 の Edit)または `wrangler login`
  - OAuth refresh token は使い捨て(ローテーション)。`docs/deploy.md` §4-4
  - wrangler は **Linux 版**(`apps/web-vue/node_modules/.bin/wrangler`)を使う。Windows global は不可

## 運用注意

- トークン・シークレットをリポジトリに commit しない (`.gitignore` で防ぐ。`wrangler pages secret put` を使う)
- 秘密の記録先(個人環境): `~/.config/opencode/` 配下 or オーナー指示に従う