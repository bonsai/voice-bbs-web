# React PoC Pages request

Create separate Cloudflare Pages project:

- project: `voice-bbs-web-react`
- expected hostname: `voice-bbs-web-react.pages.dev`
- source: `apps/web-react`
- build: `npm install && npm run build`
- output: `apps/web-react/dist`
- deploy workflow: `.github/workflows/deploy-react-poc.yml`
