import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Plus, Minus, LocateFixed } from 'lucide-react'
import type { Location } from '../types'
import { landPaths, project, viewBox } from '../lib/projection'
import PinMarker from './PinMarker'
import ArchipelagoInset from './ArchipelagoInset'

const PIN_SCALE = 1.5

interface Props {
  locations: Location[]
  transformRef: React.MutableRefObject<any>
  highlightId: number | null
  reduced: boolean
  onPinSelect: (loc: Location) => void
  theme: 'light' | 'dark'
}

function CtrlButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-12 w-12 place-items-center rounded-2xl bg-white/70 dark:bg-slate-950/70 text-slate-700 dark:text-slate-200 shadow-xl border border-slate-200/50 dark:border-white/10 backdrop-blur-md transition-all duration-300 hover:border-red-500/50 dark:hover:border-amber-500/50 hover:bg-red-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-slate-950 hover:scale-110 hover:shadow-red-500/20 dark:hover:shadow-amber-500/20 active:scale-90"
    >
      {children}
    </button>
  )
}

// Thuật toán đẩy khoảng cách để phân tán các ghim bị trùng lặp hoặc nằm quá sát nhau
function resolveCollisions(locations: Location[]): Map<number, [number, number]> {
  const coordinates = new Map<number, [number, number]>()
  
  // Khởi tạo tọa độ chiếu ban đầu
  locations.forEach((loc) => {
    coordinates.set(loc.id, project(loc.lng, loc.lat))
  })
  
  const threshold = 13 // Khoảng cách tối thiểu giữa 2 ghim (theo hệ tọa độ viewBox)
  const len = locations.length
  
  // Chạy thuật toán đẩy lực đơn giản để dịch chuyển nhẹ các ghim quá sát nhau
  for (let i = 0; i < len; i++) {
    const locA = locations[i]
    const coordA = coordinates.get(locA.id)!
    
    for (let j = i + 1; j < len; j++) {
      const locB = locations[j]
      const coordB = coordinates.get(locB.id)!
      
      const dx = coordB[0] - coordA[0]
      const dy = coordB[1] - coordA[1]
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist < threshold) {
        // Nếu cách nhau quá gần, đẩy xa nhau theo hướng đối xứng
        const angle = dist > 0 ? Math.atan2(dy, dx) : (i * 0.5) // Hướng đẩy chéo ngẫu nhiên nếu trùng khít tọa độ
        const force = (threshold - dist) / 2
        
        coordA[0] -= Math.cos(angle) * force
        coordA[1] -= Math.sin(angle) * force
        coordB[0] += Math.cos(angle) * force
        coordB[1] += Math.sin(angle) * force
      }
    }
  }
  
  return coordinates
}

export default function MapView({
  locations,
  transformRef,
  highlightId,
  reduced,
  onPinSelect,
  theme,
}: Props) {
  // Theo dõi mức zoom hiện tại để bù tỉ lệ cho ghim (giữ kích thước cố định trên màn hình).
  // Throttle bằng requestAnimationFrame + chỉ cập nhật khi scale thực sự đổi
  // -> pan không gây re-render ghim, zoom mới cập nhật.
  const [zoom, setZoom] = useState(1)
  const [hoveredId, setHoveredId] = useState<number | null>(null) // State theo dõi ghim đang được hover
  const rafRef = useRef<number>()
  const pendingScale = useRef(1)

  // Tính toán lại tọa độ chống trùng nhau (collision resolution)
  const projectedCoords = useMemo(() => {
    return resolveCollisions(locations)
  }, [locations])

  // Sắp xếp thứ tự vẽ ghim: ghim hover trên cùng -> ghim highlight -> ghim của bản thân -> ghim trống -> Y-sorting (Nam trên Bắc)
  const sortedLocations = useMemo(() => {
    return [...locations].sort((a, b) => {
      // 1. Ghim đang hover lên trên cùng
      if (a.id === hoveredId) return 1
      if (b.id === hoveredId) return -1

      // 2. Ghim đang highlight (bay tới) lên trên
      if (a.id === highlightId) return 1
      if (b.id === highlightId) return -1

      // 3. Ghim của bản thân (isMe) vẽ trên ghim của người khác
      const aMe = a.owner?.isMe ? 1 : 0
      const bMe = b.owner?.isMe ? 1 : 0
      if (aMe !== bMe) return aMe - bMe

      // 4. Ghim còn trống (available) vẽ trên ghim đã khóa (owned)
      const aAvail = a.status === 'available' ? 1 : 0
      const bAvail = b.status === 'available' ? 1 : 0
      if (aAvail !== bAvail) return aAvail - bAvail

      // 5. Y-sorting: Vĩ độ thấp hơn (ở phía Nam, Y lớn hơn) vẽ sau cùng để đè lên các ghim phía Bắc (Y nhỏ hơn)
      return b.lat - a.lat
    })
  }, [locations, hoveredId, highlightId])

  const handleTransformed = useCallback(
    (ref: any, state: { scale: number }) => {
      if (ref.wrapperComponent) {
        ref.wrapperComponent.style.setProperty('--map-scale', state.scale.toString())
      }
      pendingScale.current = state.scale
      if (rafRef.current != null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = undefined
        setZoom((prev) =>
          Math.abs(prev - pendingScale.current) > 0.001 ? pendingScale.current : prev,
        )
      })
    },
    [],
  )

  const handleInit = useCallback(
    (ref: any) => {
      if (ref.wrapperComponent) {
        ref.wrapperComponent.style.setProperty('--map-scale', ref.state.scale.toString())
      }
    },
    [],
  )

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className={`sea-bg sea-grid relative h-full w-full overflow-hidden ${theme === 'dark' ? 'sea-dark' : 'sea-light'}`}>
      <TransformWrapper
        ref={transformRef}
        minScale={0.85}
        maxScale={9}
        initialScale={1}
        centerOnInit
        limitToBounds
        doubleClick={{ mode: 'zoomIn', step: 0.7 }}
        wheel={{ step: 0.09, smoothStep: 0.006 }}
        pinch={{ step: 5 }}
        panning={{ velocityDisabled: false }}
        onInit={handleInit}
        onTransformed={handleTransformed}
        customTransform={(x, y, scale) => `translate(${x}px, ${y}px) scale(${scale})`}
      >

        {() => (
          <>
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%' }}
            >
              <svg
                viewBox={viewBox}
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label="Bản đồ Việt Nam với các ghim địa danh"
                style={{ display: 'block' }}
              >
                <defs>
                  {/* Dải gradient đỏ vàng của Tổ quốc đầy kiêu hãnh */}
                  <linearGradient id="landGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffea00" /> {/* Vàng hoàng kim Bắc Bộ */}
                    <stop offset="45%" stopColor="#ff7600" /> {/* Cam ấm áp Miền Trung */}
                    <stop offset="100%" stopColor="#da251d" /> {/* Đỏ cờ kiêu hãnh Nam Bộ */}
                  </linearGradient>
                </defs>

                {/* Đất liền + đảo.
                    (Đã bỏ bộ lọc drop-shadow trên khối đất: filter buộc trình duyệt
                    rasterize lại toàn bộ đường bờ ~1600 điểm ở MỖI khung khi zoom →
                    rất giật trên điện thoại. Giữ gradient + viền cho vẫn nổi khối.) */}
                <g>
                  {landPaths.map((d, i) => (
                    <path
                      key={i}
                      d={d}
                      fill="url(#landGradient)"
                      stroke={theme === 'dark' ? '#ffe082' : '#ffffff'}
                      strokeWidth={theme === 'dark' ? 0.5 : 0.65}
                      strokeLinejoin="round"
                    >
                      <title>Dải đất hình chữ S - Tổ quốc Việt Nam thân yêu</title>
                    </path>
                  ))}
                </g>

                <ArchipelagoInset theme={theme} />

                {/* Ghim địa danh */}
                {sortedLocations.map((loc) => {
                  const [px, py] = projectedCoords.get(loc.id) || project(loc.lng, loc.lat)
                  const originalIndex = locations.indexOf(loc)
                  return (
                    <g id={`pin-${loc.id}`} key={loc.id}>
                      <PinMarker
                        loc={loc}
                        x={px}
                        y={py}
                        index={originalIndex >= 0 ? originalIndex : 0}
                        scale={PIN_SCALE}
                        zoom={zoom}
                        highlighted={highlightId === loc.id}
                        reduced={reduced}
                        onSelect={onPinSelect}
                        onHoverChange={(hovered) => setHoveredId(hovered ? loc.id : null)}
                      />
                    </g>
                  )
                })}
              </svg>
            </TransformComponent>

            {/* Nút điều khiển zoom */}
            <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2.5">
              <CtrlButton label="Phóng to" onClick={() => transformRef.current?.zoomIn(0.4)}>
                <Plus size={20} strokeWidth={2.4} />
              </CtrlButton>
              <CtrlButton label="Thu nhỏ" onClick={() => transformRef.current?.zoomOut(0.4)}>
                <Minus size={20} strokeWidth={2.4} />
              </CtrlButton>
              <CtrlButton
                label="Về vị trí ban đầu"
                onClick={() => transformRef.current?.resetTransform(400)}
              >
                <LocateFixed size={19} strokeWidth={2.2} />
              </CtrlButton>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}
