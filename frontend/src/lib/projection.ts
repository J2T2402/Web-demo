import vietnamGeo from '../data/vietnam.json'

// Bản đồ tự dựng bằng phép chiếu Mercator phẳng (planar).
// Lý do không dùng d3-geo: dữ liệu GeoJSON này có chiều cuốn vòng (winding)
// khiến phép chiếu cầu của d3 hiểu nhầm mỗi đa giác là "cả địa cầu".
// Việt Nam ở xa cực & kinh tuyến 180° nên Mercator phẳng cho kết quả chính xác,
// đồng thời miễn nhiễm với lỗi winding (ta tự vẽ outline nên chiều cuốn vô nghĩa).

const FC = vietnamGeo as any

const FIT_W = 620
const FIT_H = 1040
const PAD = 24
const D2R = Math.PI / 180

const mercY = (latDeg: number) =>
  Math.log(Math.tan(Math.PI / 4 + (latDeg * D2R) / 2))

// Toạ độ phẳng thô (x theo kinh độ-radian, y lật để Bắc ở trên).
const raw = (lng: number, lat: number): [number, number] => [lng * D2R, -mercY(lat)]

type Ring = number[][]
function eachRing(geom: any, cb: (ring: Ring) => void) {
  if (geom.type === 'Polygon') geom.coordinates.forEach(cb)
  else if (geom.type === 'MultiPolygon')
    geom.coordinates.forEach((p: Ring[]) => p.forEach(cb))
}

// Bao toàn bộ toạ độ để tính khung.
let minX = Infinity
let minY = Infinity
let maxX = -Infinity
let maxY = -Infinity
for (const f of FC.features) {
  eachRing(f.geometry, (ring) => {
    for (const [lng, lat] of ring) {
      const [x, y] = raw(lng, lat)
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  })
}

const rawW = maxX - minX
const rawH = maxY - minY
const scale = Math.min((FIT_W - 2 * PAD) / rawW, (FIT_H - 2 * PAD) / rawH)
const drawW = rawW * scale
const drawH = rawH * scale
const offX = PAD + (FIT_W - 2 * PAD - drawW) / 2
const offY = PAD + (FIT_H - 2 * PAD - drawH) / 2

/** Chiếu (lng, lat) -> [x, y] trong hệ toạ độ viewBox. */
export function project(lng: number, lat: number): [number, number] {
  const [rx, ry] = raw(lng, lat)
  return [(rx - minX) * scale + offX, (ry - minY) * scale + offY]
}

function ringToPath(ring: Ring): string {
  let d = ''
  ring.forEach(([lng, lat], i) => {
    const [x, y] = project(lng, lat)
    d += `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)} `
  })
  return d + 'Z'
}

/** Path SVG ("d") cho đất liền + từng đảo. */
export const landPaths: string[] = FC.features.map((f: any) => {
  let d = ''
  eachRing(f.geometry, (ring) => {
    d += ringToPath(ring)
  })
  return d
})

// --- Quần đảo Hoàng Sa & Trường Sa: đặt theo TOẠ ĐỘ THẬT (như Google Maps) ---
// Hoàng Sa ~16.5°N, 112°E (ngoài khơi Đà Nẵng); Trường Sa ~9.5°N, 112.8°E
// (đông nam, xa bờ). Chiếu cùng phép chiếu nên nằm đúng vị trí tương đối ngoài biển.
export interface ArchiBox {
  x: number
  y: number
  w: number
  h: number
  label: string
}

const BOX_W = drawW * 0.32
const BOX_H = BOX_W * 0.6
const ARCHI_DEFS = [
  { lng: 112.0, lat: 16.5, label: 'Q.Đ. HOÀNG SA' },
  { lng: 112.8, lat: 9.5, label: 'Q.Đ. TRƯỜNG SA' },
]
export const archiBoxes: ArchiBox[] = ARCHI_DEFS.map((d) => {
  const [cx, cy] = project(d.lng, d.lat)
  return { x: cx - BOX_W / 2, y: cy - BOX_H / 2, w: BOX_W, h: BOX_H, label: d.label }
})

// viewBox ôm cả đất liền lẫn vùng biển chứa hai quần đảo.
const VB_PAD = 26
const left = offX
const right = Math.max(offX + drawW, ...archiBoxes.map((b) => b.x + b.w))
const top = Math.min(offY, ...archiBoxes.map((b) => b.y))
const bottom = Math.max(offY + drawH, ...archiBoxes.map((b) => b.y + b.h))

export const vbX = left - VB_PAD
export const vbY = top - VB_PAD
export const vbWidth = right - left + VB_PAD * 2
export const vbHeight = bottom - top + VB_PAD * 2
export const viewBox = `${vbX} ${vbY} ${vbWidth} ${vbHeight}`
