import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' so the built site works when served from any sub-path or opened
// behind a reverse proxy. Routing uses HashRouter, so static hosting needs no
// special rewrite rules.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // Dev: chuyển tiếp API + realtime sang backend (:3000) -> cùng origin, không vướng CORS.
    proxy: {
      '/api': 'http://localhost:3000',
      '/socket.io': { target: 'http://localhost:3000', ws: true },
    },
  },
})
