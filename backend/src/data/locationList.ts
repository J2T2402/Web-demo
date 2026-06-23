import fs from 'fs'
import path from 'path'

// Một địa danh để seed (nguồn: document/LocationList.md — single source of truth).
export interface SeedLocation {
  id: number
  name: string
  province: string
  lat: number
  lng: number
}

// Các vị trí có thể chứa LocationList.md (chạy được cả dev lẫn trong Docker).
function candidatePaths(): string[] {
  return [
    process.env.LOCATION_LIST_PATH, // ưu tiên biến môi trường nếu có
    path.resolve(process.cwd(), 'LocationList.md'), // Docker: copy vào /app
    path.resolve(process.cwd(), '../document/LocationList.md'), // dev: chạy từ server/
    path.resolve(process.cwd(), 'document/LocationList.md'), // chạy từ gốc repo
    path.resolve(__dirname, '../../LocationList.md'),
    path.resolve(__dirname, '../../../document/LocationList.md'),
  ].filter((p): p is string => !!p)
}

function findFile(): string {
  for (const p of candidatePaths()) {
    if (fs.existsSync(p)) return p
  }
  throw new Error(
    '[locationList] Không tìm thấy LocationList.md. Đặt biến LOCATION_LIST_PATH hoặc copy file vào image.',
  )
}

// Định dạng dòng: "STT. Tên - vĩ độ, kinh độ - Tỉnh/Thành" (Tỉnh/Thành tùy chọn).
// Tên dùng en-dash "–" nên dấu "-" đầu tiên luôn là ranh giới tên/tọa độ.
// Tỉnh là đoạn cuối nên vẫn đúng kể cả khi tỉnh chứa "-" (vd: "Bà Rịa - Vũng Tàu").
const LINE = /^\s*(\d+)\.\s*(.+?)\s*-\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:-\s*(.+?))?\s*$/

/** Đọc & phân tích LocationList.md thành danh sách địa danh (đã sort theo id). */
export function parseLocationList(file: string = findFile()): SeedLocation[] {
  const text = fs.readFileSync(file, 'utf8')
  const items: SeedLocation[] = []
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(LINE)
    if (!m) continue
    items.push({
      id: Number(m[1]),
      name: m[2].trim(),
      lat: Number(m[3]),
      lng: Number(m[4]),
      province: (m[5] ?? '').trim(),
    })
  }
  if (items.length === 0) {
    throw new Error(`[locationList] Không đọc được địa danh nào từ ${file} (sai định dạng?)`)
  }
  return items.sort((a, b) => a.id - b.id)
}
