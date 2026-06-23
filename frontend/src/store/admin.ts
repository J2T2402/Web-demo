import { useSyncExternalStore } from 'react'
import type { Location } from '../types'
import { apiAdminLocations, apiAdminUpdate } from '../lib/api'
import { auth } from './auth'

// Store riêng cho trang admin: dữ liệu kèm ĐẦY ĐỦ họ tên + SĐT (khác store công khai).
let locs: Location[] = []
const subs = new Set<() => void>()
function emit() {
  subs.forEach((s) => s())
}

export const adminStore = {
  subscribe(cb: () => void) {
    subs.add(cb)
    return () => subs.delete(cb)
  },
  snapshot(): Location[] {
    return locs
  },
  /** Tải lại danh sách từ API admin (cần token). */
  async refresh() {
    const t = auth.token()
    if (!t) return
    locs = await apiAdminLocations(t)
    emit()
  },
  /** Sửa tên: cập nhật lạc quan rồi gọi API. */
  async updateName(id: number, name: string) {
    const t = auth.token()
    if (!t) return
    locs = locs.map((l) => (l.id === id ? { ...l, name: name.trim() } : l))
    emit()
    await apiAdminUpdate(t, id, name.trim())
  },
}

export function useAdminLocations(): Location[] {
  return useSyncExternalStore(adminStore.subscribe, adminStore.snapshot, () => locs)
}
