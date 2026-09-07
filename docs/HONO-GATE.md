# Hono merge gate

The Hono API is the backend contract shared by all future frontends.

A Hono feature branch is ready to merge only when these commands pass in `apps/web-vue`:

```bash
npm run test:hono
npm run typecheck
npm run test
npm run build
```

The GitHub Actions `hono-gate` job runs the same sequence for every pull request.

Frontend work starts only after the Hono chain is reviewed and accepted.
