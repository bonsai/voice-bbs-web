# Frontend Stack Comparison

基準日: 2026-09-07

Voice BBS is a browser SPA centered on voice recording/playback, bubble UI, pointer interaction, and Cloudflare Pages/Functions + D1/R2.

| Axis | Vue 3 + Vite | Next.js | React + Vite |
|---|---|---|---|
| Current implementation | apps/web-vue | apps/web-next | not implemented |
| SPA fit | strong | possible via static export | strong |
| Audio/canvas | straightforward | possible, with framework boundaries | straightforward |
| Existing test assets | Vitest | weaker existing assets | new setup |
| Build | Vite | Next build/export | Vite |
| Migration cost | current baseline | low if retained | high |

Existing repo measurements are documented in `docs/compare-next-vue.md`: Vue initial JS about 85 kB / gzip 33.4 kB; Next initial JS about 112 kB. React is not measured because there is no React implementation in this repo.

## Decision

Keep Vue 3 + Vite as the current product line. Keep Next.js for comparison/rollback. Treat React as a candidate for a controlled PoC only.

## React PoC

Implement only Lobby, RoomView, VoiceBubble, and recorder in React + Vite, then compare bundle size, build time, tests, typecheck, pointer/audio implementation complexity, and deployment complexity under the same conditions as Vue.
