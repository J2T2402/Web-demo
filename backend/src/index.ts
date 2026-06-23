import express from 'express'
import http from 'http'
import path from 'path'
import fs from 'fs'
import { ENV } from './env'
import { ensureSeed } from './seed'
import { initRealtime } from './lib/realtime'
import { publicRouter } from './routes/public'
import { adminRouter } from './routes/admin'

async function main() {
  // Seed dữ liệu lần đầu (idempotent) trước khi nhận request.
  await ensureSeed()

  const app = express()
  app.set('trust proxy', 1) // sau reverse proxy (Caddy/Nginx) -> req.ip đúng
  app.use(express.json())

  // ---- API ----
  app.get('/api/health', (_req, res) => res.json({ ok: true }))
  app.use('/api/admin', adminRouter)
  app.use('/api', publicRouter)
  // API không khớp -> 404 JSON (đặt TRƯỚC static để không trả index.html cho /api).
  app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }))

  // ---- Frontend tĩnh (Cách 1: gộp FE + BE) ----
  // public/ chứa nội dung frontend đã build; chỉ tồn tại ở môi trường production.
  const PUBLIC_DIR = path.resolve(__dirname, '..', 'public')
  if (fs.existsSync(PUBLIC_DIR)) {
    app.use(express.static(PUBLIC_DIR))
    app.get('*', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')))
    console.log(`[static] Phục vụ frontend từ ${PUBLIC_DIR}`)
  } else {
    console.log('[static] Không có public/ — chế độ dev, frontend chạy bằng Vite')
  }

  // ---- HTTP server + realtime ----
  const server = http.createServer(app)
  initRealtime(server)
  server.listen(ENV.PORT, () => {
    console.log(`Server chạy tại http://localhost:${ENV.PORT}  (env=${ENV.NODE_ENV})`)
  })
}

main().catch((e) => {
  console.error('[fatal]', e)
  process.exit(1)
})
