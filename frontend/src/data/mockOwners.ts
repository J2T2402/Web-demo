// Sinh dữ liệu khách hàng GIẢ (mock) cho demo.

const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý']
const DEM = ['Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Thanh', 'Quang', 'Ngọc', 'Gia', 'Khánh', 'Bảo', 'Anh', 'Thu', 'Hải']
const TEN = ['An', 'Bình', 'Cường', 'Dũng', 'Hà', 'Hương', 'Khoa', 'Lan', 'Linh', 'Mai', 'Nam', 'Phúc', 'Quân', 'Sơn', 'Trang', 'Tú', 'Vy', 'Yến', 'Hùng', 'Nhung']
const PREFIX = ['032', '033', '034', '035', '036', '037', '038', '039', '070', '076', '077', '078', '079', '081', '082', '083', '084', '085', '088', '090', '091', '093', '094', '096', '097', '098']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randomName(): string {
  return `${pick(HO)} ${pick(DEM)} ${pick(TEN)}`
}

export function randomPhone(): string {
  const tail = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('')
  return pick(PREFIX) + tail
}

export function randomOwner(): { fullName: string; phone: string } {
  return { fullName: randomName(), phone: randomPhone() }
}

// Mốc thời gian "đã chọn" cố định (để dữ liệu khởi tạo không phụ thuộc Date.now).
export const CLAIMED_TIMES: string[] = [
  '2026-06-20T09:12:00',
  '2026-06-20T14:03:00',
  '2026-06-21T08:45:00',
  '2026-06-21T10:21:00',
  '2026-06-21T16:39:00',
  '2026-06-21T19:50:00',
  '2026-06-22T07:30:00',
  '2026-06-22T08:05:00',
  '2026-06-22T08:58:00',
  '2026-06-22T09:41:00',
  '2026-06-22T10:15:00',
  '2026-06-22T10:47:00',
]
