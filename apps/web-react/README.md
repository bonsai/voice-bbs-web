# Voice BBS React PoC

React + Viteによる最小比較実装です。

## Scope
- Lobby
- RoomView
- VoiceBubble
- pointerベースの録音導線モック

既存のBE/API/DBは利用せず、技術選定比較を目的とします。

## Cloudflare Pages
- Project: `voice-bbs-web-react`
- Expected URL: `https://voice-bbs-web-react.pages.dev`
- Workflow: `.github/workflows/deploy-react-poc.yml`

`CLOUDFLARE_API_TOKEN` が設定されたGitHub Actionsでデプロイします。
