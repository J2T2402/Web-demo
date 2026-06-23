// Bảng màu trạng thái ghim (đồng bộ với tailwind.config.js)
export const COLORS = {
  available: '#10b981', // Xanh lục ngọc tươi trẻ - còn trống
  availableDeep: '#059669',
  owned: '#cbd5e1', // Xám thanh lịch - đã bị người khác chọn (khóa)
  ownedDeep: '#94a3b8',
  mine: '#da251d', // Đỏ cờ Tổ quốc kiêu hãnh - ghim của BẠN
  mineDeep: '#b91c1c',
}

export function pinColor(status: 'available' | 'owned', isMe?: boolean): string {
  if (status === 'available') return COLORS.available
  return isMe ? COLORS.mine : COLORS.owned
}
