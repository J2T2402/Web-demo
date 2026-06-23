import { archiBoxes, type ArchiBox } from '../lib/projection'

interface IslandNode {
  x: number
  y: number
  r: number // Tỉ lệ kích thước của đảo
}

// Giả lập phân bổ địa lý tương đối chuẩn của Quần đảo Hoàng Sa
const HOANG_SA_ISLANDS: IslandNode[] = [
  { x: 0.22, y: 0.26, r: 2.2 }, // Nhóm Trăng Khuyết (Lưỡi Liềm)
  { x: 0.32, y: 0.22, r: 1.5 },
  { x: 0.26, y: 0.35, r: 1.8 },
  { x: 0.58, y: 0.26, r: 3.8 }, // Nhóm An Vĩnh (Đảo Phú Lâm lớn nhất)
  { x: 0.66, y: 0.22, r: 2.0 },
  { x: 0.72, y: 0.35, r: 1.6 },
  { x: 0.52, y: 0.52, r: 2.8 }, // Đảo Linh Côn
  { x: 0.35, y: 0.58, r: 1.4 },
]

// Giả lập phân bổ địa lý tương đối chuẩn của Quần đảo Trường Sa
const TRUONG_SA_ISLANDS: IslandNode[] = [
  { x: 0.2, y: 0.22, r: 2.4 }, // Cụm Song Tử
  { x: 0.32, y: 0.28, r: 1.8 }, // Cụm Thị Tứ
  { x: 0.58, y: 0.25, r: 2.5 }, // Đảo Nam Yết
  { x: 0.52, y: 0.44, r: 3.2 }, // Cụm Sinh Tồn
  { x: 0.28, y: 0.62, r: 4.2 }, // Đảo Trường Sa Lớn (đô thị biển đảo)
  { x: 0.68, y: 0.52, r: 2.8 }, // Đảo Trường Sa Đông
  { x: 0.78, y: 0.32, r: 2.2 }, // Cụm Bình Nguyên
  { x: 0.82, y: 0.65, r: 1.6 }, // Các bãi ngầm phía Nam
]

function Box({ box, theme }: { box: ArchiBox; theme: 'light' | 'dark' }) {
  const { x, y, w, h, label } = box
  const fs = Math.max(7.5, h * 0.17)
  const dotR = Math.max(0.9, h * 0.022)

  // Chọn đúng phân bổ đảo theo tên quần đảo
  const islands = label.includes('HOÀNG SA') ? HOANG_SA_ISLANDS : TRUONG_SA_ISLANDS

  return (
    <g>
      {/* 1. Khung nền Glassmorphic bo góc cực kỳ hiện đại với viền phát sáng nhẹ */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={18}
        fill={theme === 'dark' ? 'rgba(6, 11, 19, 0.68)' : 'rgba(255, 255, 255, 0.8)'}
        stroke={theme === 'dark' ? 'rgba(245, 158, 11, 0.42)' : 'rgba(218, 37, 29, 0.28)'}
        strokeWidth={1.2}
      />

      {/* 2. Vẽ các thực thể đảo dạng Ngọc trai lấp lánh & Sóng biển lan tỏa êm đềm */}
      {islands.map((island, i) => {
        const cx = x + island.x * w
        const cy = y + island.y * (h - fs * 2.4)
        const currentR = dotR * (island.r / 2) // Điều chỉnh bán kính theo tỉ lệ thực tế

        return (
          <g key={i}>
            {/* Đầm nước xanh lam cạn (lagoon) quanh đảo */}
            <circle
              cx={cx}
              cy={cy}
              r={currentR * 3.2}
              fill="#0ea5e9"
              opacity={theme === 'dark' ? 0.18 : 0.2}
            />

            {/* Nhân đảo cốt lõi đồng nhất màu sắc vàng-đỏ Tổ Quốc */}
            <circle
              cx={cx}
              cy={cy}
              r={currentR}
              fill="url(#landGradient)"
              stroke={theme === 'dark' ? '#ffea00' : '#da251d'}
              strokeWidth={0.6}
            />
          </g>
        )
      })}

      {/* 3. Huy hiệu Trái tim cờ đỏ sao vàng khẳng định chủ quyền đầy yêu thương */}
      <g transform={`translate(${x + w - 18}, ${y + 18})`} className="select-none pointer-events-none">
        {/* Đường viền trái tim */}
        <path
          d="M 0 -3.6 C -3.6 -8.1 -9 -5.4 -9 0 C -9 5.4 0 10.8 0 10.8 C 0 10.8 9 5.4 9 0 C 9 -5.4 3.6 -8.1 0 -3.6 Z"
          fill="#da251d"
          stroke="#ffffff"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Ngôi sao vàng trong tim */}
        <polygon
          points="0,-2.2 0.6,-0.6 2.2,-0.6 0.9,0.4 1.4,2 0,1 -1.4,2 -0.9,0.4 -2.2,-0.6 -0.6,-0.6"
          fill="#ffea00"
        />
      </g>

      {/* 4. Nhãn tên quần đảo đầy tôn kính và thân thiện */}
      <text
        x={x + w / 2}
        y={y + h - 20}
        textAnchor="middle"
        fontSize={fs}
        fontWeight={900}
        fill={theme === 'dark' ? '#ffea00' : '#da251d'}
        letterSpacing={0.8}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          textShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.9)' : '0 1px 3px rgba(255,255,255,0.9)'
        }}
      >
        {label.replace('Q.Đ. ', '')}
      </text>
      <text
        x={x + w / 2}
        y={y + h - 8}
        textAnchor="middle"
        fontSize={fs * 0.72}
        fontWeight={850}
        fill={theme === 'dark' ? '#94a3b8' : '#475569'}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          textShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.9)' : '0 1px 3px rgba(255,255,255,0.9)'
        }}
      >
        (Việt Nam)
      </text>
    </g>
  )
}

export default function ArchipelagoInset({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <g aria-hidden="true">
      {archiBoxes.map((b) => (
        <Box key={b.label} box={b} theme={theme} />
      ))}
    </g>
  )
}
