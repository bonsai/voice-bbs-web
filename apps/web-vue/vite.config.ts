import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // local dev: 本番の Hono Functions(同一 API 境界)へ転送
      '/api': 'https://voice-bbs-web.pages.dev',
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
