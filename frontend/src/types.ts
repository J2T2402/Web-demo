export type Status = 'available' | 'owned'

export interface Owner {
  fullName: string
  phone: string
  /** ISO string */
  claimedAt: string
  /** true if claimed by the current visitor in this session */
  isMe?: boolean
  /** true if claimed by the realtime simulation (someone else, just now) */
  isLive?: boolean
}

export interface Location {
  id: number
  name: string
  province: string
  lat: number
  lng: number
  status: Status
  owner?: Owner
}

export type ClaimResult =
  | { ok: true }
  | { ok: false; reason: 'taken' | 'duplicate' | 'notfound' | 'invalid' }
