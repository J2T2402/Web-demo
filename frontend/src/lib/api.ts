// Lớp gọi API backend. Base URL mặc định rỗng = cùng origin
// (production gộp FE+BE theo Cách 1; dev được Vite proxy /api -> :3000).
import type { Location, ClaimResult } from '../types'

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const url = (p: string) => `${BASE}${p}`

/** Dữ liệu công khai cho 1 ghim (không kèm thông tin chủ). */
export async function fetchLocations(): Promise<Location[]> {
  const r = await fetch(url('/api/locations'))
  if (!r.ok) throw new Error(`GET /api/locations -> ${r.status}`)
  return r.json()
}

/** Đăng ký sở hữu 1 ghim. Map HTTP response về ClaimResult của frontend. */
export async function postClaim(id: number, fullName: string, phone: string): Promise<ClaimResult> {
  const r = await fetch(url(`/api/locations/${id}/claim`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, phone }),
  })
  type Reason = 'taken' | 'duplicate' | 'notfound' | 'invalid'
  const data = (await r.json().catch(() => ({}))) as { ok?: boolean; reason?: Reason }
  if (r.ok && data.ok) return { ok: true }
  return { ok: false, reason: data.reason ?? 'invalid' }
}

/** Admin: đăng nhập -> trả token JWT, hoặc null nếu sai. */
export async function apiAdminLogin(username: string, password: string): Promise<string | null> {
  const r = await fetch(url('/api/admin/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!r.ok) return null
  const data = (await r.json()) as { token?: string }
  return data.token ?? null
}

/** Admin: danh sách địa danh kèm đầy đủ họ tên + SĐT (đã giải mã phía server). */
export async function apiAdminLocations(token: string): Promise<Location[]> {
  const r = await fetch(url('/api/admin/locations'), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!r.ok) throw new Error(`GET /api/admin/locations -> ${r.status}`)
  return r.json()
}

/** Admin: sửa tên địa danh. */
export async function apiAdminUpdate(token: string, id: number, name: string): Promise<void> {
  const r = await fetch(url(`/api/admin/locations/${id}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  })
  if (!r.ok) throw new Error(`PATCH /api/admin/locations/${id} -> ${r.status}`)
}
