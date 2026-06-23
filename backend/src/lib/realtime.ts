import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'

let io: Server | null = null

/** Sự kiện phát tới mọi client khi 1 ghim vừa bị chọn (đã ẩn danh — không kèm PII). */
export interface ClaimedEvent {
  id: number
  name: string
  province: string
  status: 'owned'
  claimedAt: string
}

export function initRealtime(server: HttpServer): Server {
  io = new Server(server)
  io.on('connection', () => {
    // Hiện chưa cần nhận sự kiện từ client; chỉ phát 1 chiều.
  })
  return io
}

/** Phát realtime "location:claimed" tới tất cả client đang kết nối. */
export function emitClaimed(event: ClaimedEvent): void {
  io?.emit('location:claimed', event)
}
