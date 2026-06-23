import { useSyncExternalStore } from 'react'
import type { ClaimResult, Location } from '../types'
import { RAW_LOCATIONS, OWNED_IDS } from '../data/locations'
import { CLAIMED_TIMES, randomOwner } from '../data/mockOwners'
import { normalizePhone } from '../lib/phone'
import { fetchLocations, postClaim } from '../lib/api'
import { connectLive } from '../lib/socket'

// ---------- State + subscription (giữ contract cũ cho useSyncExternalStore) ----------
type State = { locations: Location[] }
let state: State = { locations: [] }
let mode: 'api' | 'mock' = 'api'

const listeners = new Set<() => void>()
function commit(next: Location[]) {
  state = { locations: next }
  listeners.forEach((l) => l())
}

// ---------- Sự kiện "vừa có người chọn" (cho toast realtime) ----------
type LiveCb = (loc: Location) => void
const liveListeners = new Set<LiveCb>()
function emitLive(loc: Location) {
  liveListeners.forEach((cb) => cb(loc))
}

// ---------- Khởi tạo: thử API thật, lỗi -> fallback mock (demo không cần backend) ----------
let started = false
export async function init() {
  if (started) return
  started = true
  try {
    const locs = await fetchLocations()
    commit(locs)
    connectLive((p) => {
      const next = state.locations.map((l) =>
        l.id === p.id
          ? { ...l, status: 'owned' as const, owner: { fullName: '', phone: '', claimedAt: p.claimedAt, isLive: true } }
          : l,
      )
      commit(next)
      const loc = next.find((l) => l.id === p.id)
      if (loc) emitLive(loc)
    })
    mode = 'api'
  } catch (e) {
    console.warn('[store] Không gọi được API — chuyển sang chế độ demo/mock.', e)
    mode = 'mock'
    commit(buildMockInitial())
    startSimulation()
  }
}

export const store = {
  subscribe(cb: () => void) {
    listeners.add(cb)
    return () => listeners.delete(cb)
  },
  getSnapshot(): State {
    return state
  },
  subscribeLive(cb: LiveCb) {
    liveListeners.add(cb)
    return () => liveListeners.delete(cb)
  },

  /** Đăng ký sở hữu 1 địa danh. Gọi API thật (hoặc mock nếu offline). */
  async claim(id: number, fullName: string, phone: string): Promise<ClaimResult> {
    if (mode === 'mock') return mockClaim(id, fullName, phone)
    const res = await postClaim(id, fullName, phone)
    if (res.ok) {
      // Cập nhật lạc quan: đánh dấu ghim của tôi (server là nguồn sự thật, sẽ đồng bộ qua socket).
      commit(
        state.locations.map((l) =>
          l.id === id
            ? {
                ...l,
                status: 'owned' as const,
                owner: { fullName: fullName.trim(), phone: normalizePhone(phone), claimedAt: new Date().toISOString(), isMe: true },
              }
            : l,
        ),
      )
    }
    return res
  },
}

// ---------- React hooks ----------
export function useLocations(): Location[] {
  return useSyncExternalStore(store.subscribe, store.getSnapshot).locations
}

// =====================================================================
// MOCK fallback — chỉ dùng khi backend chưa chạy (giữ trải nghiệm demo).
// =====================================================================
function buildMockInitial(): Location[] {
  return RAW_LOCATIONS.map((l) => {
    const ownedIndex = OWNED_IDS.indexOf(l.id)
    if (ownedIndex >= 0) {
      const o = randomOwner()
      return {
        ...l,
        status: 'owned' as const,
        owner: { fullName: o.fullName, phone: o.phone, claimedAt: CLAIMED_TIMES[ownedIndex % CLAIMED_TIMES.length] },
      }
    }
    return { ...l, status: 'available' as const }
  })
}

function mockClaim(id: number, fullName: string, phone: string): ClaimResult {
  const loc = state.locations.find((l) => l.id === id)
  if (!loc) return { ok: false, reason: 'notfound' }
  if (loc.status === 'owned') return { ok: false, reason: 'taken' }
  const norm = normalizePhone(phone)
  const dup = state.locations.some((l) => l.owner && normalizePhone(l.owner.phone) === norm)
  if (dup) return { ok: false, reason: 'duplicate' }
  commit(
    state.locations.map((l) =>
      l.id === id
        ? { ...l, status: 'owned' as const, owner: { fullName: fullName.trim(), phone: norm, claimedAt: new Date().toISOString(), isMe: true } }
        : l,
    ),
  )
  return { ok: true }
}

let simTimer: ReturnType<typeof setTimeout> | undefined
const KEEP_AVAILABLE = 14
export function startSimulation() {
  if (simTimer) return
  const tick = () => {
    const avail = state.locations.filter((l) => l.status === 'available')
    if (avail.length > KEEP_AVAILABLE) {
      const pick = avail[Math.floor(Math.random() * avail.length)]
      const o = randomOwner()
      const claimed: Location = {
        ...pick,
        status: 'owned',
        owner: { fullName: o.fullName, phone: o.phone, claimedAt: new Date().toISOString(), isLive: true },
      }
      commit(state.locations.map((l) => (l.id === pick.id ? claimed : l)))
      emitLive(claimed)
    }
    simTimer = setTimeout(tick, 9000 + Math.random() * 8000)
  }
  simTimer = setTimeout(tick, 6500)
}

export function stopSimulation() {
  if (simTimer) clearTimeout(simTimer)
  simTimer = undefined
}
