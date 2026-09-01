import { onRequest as __api___route___ts_onRequest } from "/home/bons/voice-bbs-web/apps/web/functions/api/[[route]].ts"

export const routes = [
    {
      routePath: "/api/:route*",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api___route___ts_onRequest],
    },
  ]