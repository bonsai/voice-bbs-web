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
      // local dev: wrangler pages dev (Functions) へ API を転送
      '/api': 'http://localhost:8788',
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
