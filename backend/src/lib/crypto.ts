import crypto from 'crypto'
import { ENV } from '../env'

// Khóa 32 byte (AES-256) dẫn xuất từ ENCRYPTION_KEY để chấp nhận key độ dài bất kỳ.
const KEY = crypto.createHash('sha256').update(ENV.ENCRYPTION_KEY).digest()

/**
 * Mã hóa reversible PII (Họ tên/SĐT) bằng AES-256-GCM.
 * Định dạng output: base64(iv):base64(tag):base64(ciphertext).
 */
export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join(':')
}

/** Giải mã chuỗi đã mã hóa bởi encrypt(). Chỉ admin (đã xác thực) mới gọi. */
export function decrypt(payload: string): string {
  const [ivB, tagB, dataB] = payload.split(':')
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, Buffer.from(ivB, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(dataB, 'base64')), decipher.final()]).toString('utf8')
}

/**
 * Băm SĐT (đã chuẩn hoá) bằng HMAC-SHA256 — dùng cho ràng buộc UNIQUE
 * "1 SĐT = 1 ghim" mà không cần giải mã. Deterministic theo cùng key.
 */
export function phoneHash(normPhone: string): string {
  return crypto.createHmac('sha256', KEY).update(normPhone).digest('hex')
}
