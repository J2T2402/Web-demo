import { useSyncExternalStore } from 'react'
import { apiAdminLogin } from '../lib/api'

// Đăng nhập admin THẬT: gọi API lấy JWT, lưu localStorage.
const KEY = 'webeventqh_admin_token'

const subs = new Set<() => void>()
function emit() {
  subs.forEach((s) => s())
}

export const auth = {
  token(): string | null {
    return localStorage.getItem(KEY)
  },
  isAuthed(): boolean {
    return !!localStorage.getItem(KEY)
  },
  async login(username: string, password: string): Promise<boolean> {
    const token = await apiAdminLogin(username, password)
    if (token) {
      localStorage.setItem(KEY, token)
      emit()
      return true
    }
    return false
  },
  logout() {
    localStorage.removeItem(KEY)
    emit()
  },
  subscribe(cb: () => void) {
    subs.add(cb)
    return () => subs.delete(cb)
  },
}

export function useAuthed(): boolean {
  return useSyncExternalStore(
    auth.subscribe,
    () => !!localStorage.getItem(KEY),
    () => false,
  )
}
