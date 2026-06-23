import dotenv from 'dotenv'

dotenv.config()

function need(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback
  if (v === undefined || v === '') {
    throw new Error(`[env] Thiếu biến môi trường bắt buộc: ${name}`)
  }
  return v
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  // DATABASE_URL là bắt buộc — không có thì không kết nối được DB.
  DATABASE_URL: need('DATABASE_URL'),
  // Các khóa dưới đây có fallback "dev" để chạy local nhanh; PHẢI đổi ở production.
  JWT_SECRET: need('JWT_SECRET', 'dev-insecure-jwt-secret-change-me'),
  ENCRYPTION_KEY: need('ENCRYPTION_KEY', 'dev-insecure-encryption-key-change-me'),
  ADMIN_USERNAME: process.env.ADMIN_USERNAME ?? 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? 'admin123',
}
