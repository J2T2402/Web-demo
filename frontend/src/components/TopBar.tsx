import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Sun, Moon } from 'lucide-react'

interface Props {
  ownedCount: number
  total: number
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export default function TopBar({ ownedCount, total, theme, toggleTheme }: Props) {
  const pct = total ? Math.round((ownedCount / total) * 100) : 0

  // Quyết định danh hiệu yêu nước dựa trên tiến trình ghim được chọn
  let badgeName = 'Người lữ hành trẻ 🎒'
  let badgeColor = 'bg-slate-200/50 text-slate-600 border-slate-200/50 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700/50'
  if (pct >= 85) {
    badgeName = 'Đại sứ Gấm Hoa 👑'
    badgeColor = 'bg-amber-500/10 text-amber-600 border-amber-500/30 font-extrabold dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 glow-amber'
  } else if (pct >= 55) {
    badgeName = 'Trái tim Việt Nam 💖'
    badgeColor = 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 glow-red animate-pulse'
  } else if (pct >= 25) {
    badgeName = 'Sứ giả danh lam 🗺️'
    badgeColor = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
  }

  return (
    <header className="z-20 flex items-center justify-between gap-3 bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/40 dark:border-white/5 px-4 py-4 backdrop-blur-lg md:px-6 text-slate-800 dark:text-slate-100 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-3">
        {/* Biểu tượng lá cờ đỏ sao vàng cách điệu hình khối trẻ trung */}
        <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20 dark:shadow-red-600/10 transition-all duration-300 hover:scale-105 active:scale-95 border border-red-400/25">
          <span className="text-xl font-bold text-yellow-300 animate-pulse glow-gold-text">★</span>
          <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-yellow-400 border-2 border-white dark:border-slate-900 shadow-sm" />
          </span>
        </div>
        <div className="leading-tight">
          <h1 className="text-base font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-orange-500 dark:from-red-500 dark:to-yellow-400 bg-clip-text text-transparent md:text-lg">
            Hành Trình Gấm Hoa
          </h1>
          <p className="hidden text-[11px] font-semibold text-slate-500 dark:text-slate-400 sm:block tracking-wide">
            Tự hào dải đất hình chữ S · Ghi dấu bản sắc của riêng bạn
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* Bảng tiến trình yêu nước (Gamification) */}
        <div className="hidden min-w-[220px] flex-col gap-1.5 sm:flex">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${badgeColor}`}>
              {badgeName}
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              Tiến trình: <b className="text-red-600 dark:text-amber-500 font-extrabold">{ownedCount}</b>/{total} ({pct}%)
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/30 dark:border-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            </motion.div>
          </div>
        </div>

        {/* Nút chuyển đổi chế độ sáng tối sáng tạo */}
        <button
          onClick={toggleTheme}
          aria-label="Chuyển chế độ sáng tối"
          className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-white/10 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-amber-400 hover:scale-105 active:scale-95 shadow-sm transition-all duration-200"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <Link
          to="/admin"
          className="flex items-center gap-1.5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-red-600 dark:hover:bg-amber-500 dark:hover:text-slate-950 hover:scale-105 active:scale-95 shadow-lg shadow-slate-950/10 dark:shadow-white/5 px-4 py-2.2 text-sm font-bold transition-all duration-200 border border-transparent hover:border-red-400/20"
        >
          <ShieldCheck size={16} />
          <span className="hidden sm:inline">Quản trị</span>
        </Link>
      </div>
    </header>
  )
}
