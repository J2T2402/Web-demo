import { COLORS } from '../lib/colors'

function Row({ color, label, isStar, theme }: { color: string; label: string; isStar?: boolean; theme: 'light' | 'dark' }) {
  return (
    <div className="flex items-center gap-2.5">
      {isStar ? (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-yellow-300 ring-1 ring-white/30">
          ★
        </span>
      ) : (
        <span
          className={`inline-block h-3 w-3 rounded-full ring-1 ${theme === 'dark' ? 'ring-white/20' : 'ring-slate-900/10'}`}
          style={{ backgroundColor: color }}
        />
      )}
      <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{label}</span>
    </div>
  )
}

export default function Legend({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div className="pointer-events-none absolute bottom-5 left-5 z-10 rounded-2xl px-4.5 py-3.5 shadow-2xl border border-slate-200/50 dark:border-white/10 backdrop-blur-lg bg-white/70 dark:bg-slate-950/75 transition-all duration-300">
      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Chú thích bản đồ
      </p>
      <div className="flex flex-col gap-2.5">
        <Row color={COLORS.available} label="Còn trống — chạm để chọn" theme={theme} />
        <Row color={COLORS.owned} label="Đã khóa — người khác chọn" theme={theme} />
        <Row color={COLORS.mine} label="Địa danh của bạn" isStar theme={theme} />
      </div>
    </div>
  )
}
