# Voice BBS Web

匿名・認証不要の音声掲示板。シャボン玉に声をのせて浮かべる。

| | |
|---|---|
| **Client** | Next.js 15 + Vue 3 |
| **Runtime** | Cloudflare Pages Functions |
| **Storage** | D1 (SQLite) + R2 (audio) |
| **Codec** | Web Audio API (WAV → PNG) |

```
  ┌────────────── docs/ ──────────────┐
  │  spec.md   仕様                   │
  │  adr.md    意思決定               │
  │  issue.md  課題 / 積み込み        │
  │  plan.md   計画                   │
  │  ux.md     UX 設計                │
  │  deploy.md デプロイ手順           │
  │  dx.md     開発体験               │
  │  test.md   テスト指針             │
  └───────────────────────────────────┘
```

© bonsai