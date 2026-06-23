// Kết nối realtime tới backend (Socket.IO). Cùng origin theo Cách 1.
import { io, type Socket } from 'socket.io-client'

/** Payload sự kiện "có người vừa chọn 1 ghim" — đã ẩn danh, không kèm PII. */
export interface ClaimedPayload {
  id: number
  name: string
  province: string
  status: 'owned'
  claimedAt: string
}

let socket: Socket | null = null

/** Mở kết nối và lắng nghe sự kiện claim. Trả hàm ngắt kết nối. */
export function connectLive(onClaimed: (p: ClaimedPayload) => void): () => void {
  const base = import.meta.env.VITE_API_URL ?? ''
  socket = base ? io(base) : io() // io() = cùng origin
  socket.on('location:claimed', onClaimed)
  return () => {
    socket?.disconnect()
    socket = null
  }
}
