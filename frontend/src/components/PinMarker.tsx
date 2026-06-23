import { motion } from 'framer-motion'
import type { Location } from '../types'
import { pinColor } from '../lib/colors'

// Pin vẽ trong hệ toạ độ 24x24 của Material, đỉnh nhọn ở (12, 22).
const PIN_PATH =
  'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'
const HEAD_CX = 12
const HEAD_CY = 9.2
const TIP_Y = 22

interface Props {
  loc: Location
  x: number
  y: number
  index: number
  scale: number
  /** Mức zoom hiện tại của bản đồ — dùng để bù tỉ lệ, giữ ghim cố định kích thước trên màn hình. */
  zoom: number
  highlighted: boolean
  reduced: boolean
  onSelect: (loc: Location) => void
  onHoverChange?: (hovered: boolean) => void
}

export default function PinMarker({
  loc,
  x,
  y,
  index,
  scale,
  zoom,
  highlighted,
  reduced,
  onSelect,
  onHoverChange,
}: Props) {
  const available = loc.status === 'available'
  const isMe = loc.owner?.isMe

  // Những location đã được người khác chọn (đã khóa) thì cho nhỏ lại (bằng 65% kích thước gốc).
  const baseS = (!available && !isMe) ? scale * 0.65 : scale
  const ringCy = -(TIP_Y - HEAD_CY)
  const color = pinColor(loc.status, isMe)
  const label = available
    ? `${loc.name} - còn trống, chạm để chọn`
    : `${loc.name} - đã được chọn`

  const handleSelect = () => {
    if (available) onSelect(loc)
  }

  return (
    <g transform={`translate(${x}, ${y})`}>
      <g
        style={{
          transform: `scale(calc(${baseS} / var(--map-scale, 1)))`,
          transformOrigin: '0px 0px',
        }}
      >
        {/* Vòng quét nhấn nháy khi được chọn từ bảng điều khiển */}
        {highlighted && (
          <motion.circle
            cx={0}
            cy={ringCy}
            r={12}
            fill="none"
            stroke={color}
            strokeWidth={2.4}
            initial={{ scale: 0.6, opacity: 0.9 }}
            animate={{ scale: [0.8, 1.8], opacity: [0.9, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        )}

        {/* Hào quang liên tục CHỈ cho ghim của BẠN (tối đa 1) — tránh chạy ~30
            animation cùng lúc gây giật khi pinch-zoom trên điện thoại. */}
        {!reduced && isMe && (
          <motion.circle
            cx={0}
            cy={ringCy}
            r={9}
            fill="none"
            stroke="#ffea00"
            strokeWidth={1.2}
            animate={{ scale: [1, 1.7], opacity: [0.75, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        )}

        <motion.g
          role={available ? 'button' : 'img'}
          tabIndex={available ? 0 : -1}
          aria-label={label}
          onClick={handleSelect}
          onKeyDown={(e) => {
            if (available && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              handleSelect()
            }
          }}
          initial={reduced ? false : { opacity: 0, scale: 0.2, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : {
                  delay: Math.min(index * 0.012, 0.8),
                  type: 'spring',
                  stiffness: 450,
                  damping: 20,
                }
          }
          whileHover={available && !reduced ? { scale: 1.25, y: -2 } : undefined}
          whileTap={available && !reduced ? { scale: 1.05 } : undefined}
          onMouseEnter={() => onHoverChange?.(true)}
          onMouseLeave={() => onHoverChange?.(false)}
          style={{
            cursor: available ? 'pointer' : 'default',
            transformBox: 'fill-box',
            transformOrigin: '50% 100%',
            outline: 'none',
          }}
        >
          <title>{available ? `${loc.name} (còn trống)` : isMe ? `${loc.name} (địa danh của BẠN)` : `${loc.name} (đã được chọn)`}</title>

          <g transform={`translate(${-HEAD_CX}, ${-TIP_Y})`}>
            {/* bóng đổ mềm dưới chân ghim */}
            <ellipse cx={HEAD_CX} cy={TIP_Y + 0.5} rx={3.5} ry={1.2} fill="rgba(3,7,18,0.35)" />
            
            {/* Ghim chính */}
            <path
              d={PIN_PATH}
              fill={color}
              stroke="#ffffff"
              strokeWidth={1.5}
              strokeLinejoin="round"
              style={{ transition: 'fill 0.4s ease' }}
            />

            {isMe ? (
              /* Ngôi sao vàng thiêng liêng tỏa sáng cho ghim của bạn */
              <polygon
                points="12,5.2 13.3,8.2 16.6,8.2 13.9,10.2 14.9,13.4 12,11.4 9.1,13.4 10.1,10.2 7.4,8.2 10.7,8.2"
                fill="#ffea00"
                stroke="#da251d"
                strokeWidth={0.5}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              />
            ) : (
              /* Số thứ tự địa danh bên trong ghim (bỏ phần mã chữ) */
              <text
                x={HEAD_CX}
                y={HEAD_CY - 0.2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={available ? '#ffffff' : '#64748b'}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
                fontWeight={900}
                fontSize={8.2}
              >
                {loc.id}
              </text>
            )}

            {/* Ổ khóa báo hiệu vị trí đã bị người khác chọn (khóa) */}
            {!available && !isMe && (
              <g transform={`translate(${HEAD_CX + 5.6}, 4.6)`} style={{ pointerEvents: 'none' }}>
                <circle r={3.6} fill="#ffffff" stroke="#94a3b8" strokeWidth={0.7} />
                <rect x={-1.6} y={-0.4} width={3.2} height={2.6} rx={0.5} fill="#64748b" />
                <path
                  d="M-1 -0.4 v-0.9 a1 1 0 0 1 2 0 v0.9"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth={0.7}
                />
              </g>
            )}
          </g>
        </motion.g>
      </g>
    </g>
  )
}
