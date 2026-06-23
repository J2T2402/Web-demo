import { useMemo, useState } from 'react'
import { Search, Lock, ChevronRight } from 'lucide-react'
import type { Location, Status } from '../types'
import { COLORS } from '../lib/colors'
import { deAccent } from '../lib/format'

type FilterKey = 'all' | 'available' | 'owned'

interface Props {
  locations: Location[]
  onFly: (id: number) => void
  onSelect: (loc: Location) => void
  theme: 'light' | 'dark'
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'available', label: 'Còn trống' },
  { key: 'owned', label: 'Đã chọn' },
]

function dotColor(status: Status, isMe?: boolean) {
  if (status === 'available') return COLORS.available
  return isMe ? COLORS.mine : COLORS.owned
}

export default function SearchPanel({ locations, onFly, onSelect, theme }: Props) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')

  const ownedCount = locations.filter((l) => l.status === 'owned').length
  const total = locations.length
  const pct = total ? Math.round((ownedCount / total) * 100) : 0

  // Quyết định danh hiệu yêu nước dựa trên tiến trình ghim được chọn
  let badgeName = 'Người lữ hành trẻ 🎒'
  let badgeColor = 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  if (pct >= 85) {
    badgeName = 'Đại sứ Gấm Hoa 👑'
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold shadow-sm dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
  } else if (pct >= 55) {
    badgeName = 'Trái tim Việt Nam 💖'
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-850'
  } else if (pct >= 25) {
    badgeName = 'Sứ giả danh lam 🗺️'
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-850'
  }

  const filtered = useMemo(() => {
    const q = deAccent(query.trim())
    return locations.filter((l) => {
      if (filter === 'available' && l.status !== 'available') return false
      if (filter === 'owned' && l.status !== 'owned') return false
      if (!q) return true
      return (
        deAccent(l.name).includes(q) ||
        deAccent(l.province).includes(q) ||
        String(l.id) === q
      )
    })
  }, [locations, query, filter])

  return (
    <div className="flex h-full flex-col bg-white/60 dark:bg-slate-950/60 backdrop-blur-lg text-slate-800 dark:text-slate-100 transition-colors duration-300 border-l border-slate-200/30 dark:border-white/5">
      {/* Chỉ hiển thị trên mobile (vì trên desktop đã hiển thị ở Header) */}
      <div className="block border-b border-slate-200/30 dark:border-white/5 p-4 lg:hidden bg-slate-50/20 dark:bg-slate-950/10">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${badgeColor}`}>
              {badgeName}
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              Tiến trình: <b className="text-red-600 dark:text-amber-500 font-extrabold">{ownedCount}</b>/{total} ({pct}%)
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-b border-slate-200/30 dark:border-white/5 p-4">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 transition-colors duration-200"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm địa danh, tỉnh/thành…"
            aria-label="Tìm địa danh"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-55/40 dark:bg-slate-900/30 py-2.5 pl-10 pr-3.5 text-sm outline-none transition-all duration-300 focus:border-red-500 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-red-500/10 dark:focus:ring-amber-500/10 text-slate-800 dark:text-slate-100 shadow-sm focus:shadow-md"
          />
        </div>
        <div className="flex gap-1.5 p-1 rounded-2xl bg-slate-100/40 dark:bg-slate-900/50 border border-slate-200/30 dark:border-white/5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all duration-300 ${
                filter === f.key
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto p-3 space-y-1">
        {filtered.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-slate-400 dark:text-slate-500">
            Không tìm thấy địa danh phù hợp.
          </p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((l) => {
              const available = l.status === 'available'
              const isMyPin = l.owner?.isMe
              
              // Thiết kế số thứ tự cao cấp tương ứng trạng thái địa danh
              let badgeClass = ''
              if (isMyPin) {
                badgeClass = 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border border-amber-400/30 shadow-[0_0_10px_rgba(245,158,11,0.35)] animate-pulse'
              } else if (available) {
                badgeClass = 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-550/20 dark:border-emerald-500/20'
              } else {
                badgeClass = 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/40'
              }

              return (
                <li key={l.id}>
                  <button
                    onClick={() => onFly(l.id)}
                    className="group flex w-full items-center gap-3.5 rounded-2xl border border-slate-100/50 dark:border-slate-900/30 bg-slate-55/20 dark:bg-slate-950/15 px-3.5 py-3 text-left transition-all duration-300 hover:border-slate-200/65 dark:hover:border-white/10 hover:bg-white/80 dark:hover:bg-slate-900/55 hover:translate-y-[-1px] hover:shadow-sm"
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-black transition-all duration-300 ${badgeClass}`}
                    >
                      {l.id}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors group-hover:text-red-600 dark:group-hover:text-amber-400">
                        {l.name}
                      </span>
                      <span className="block truncate text-[11px] font-medium text-slate-500 dark:text-slate-500 mt-0.5">
                        {l.province}
                      </span>
                    </span>
                    {available ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelect(l)
                        }}
                        className="shrink-0 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/25 border border-emerald-500/20 dark:border-emerald-500/30 px-3 py-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-350 transition-all duration-200 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white cursor-pointer"
                      >
                        Chọn
                      </span>
                    ) : (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-500 bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/30 dark:border-slate-700/30 px-2 py-1 rounded-md">
                        <Lock size={10} className="shrink-0" />
                        Đã khóa
                      </span>
                    )}
                    <ChevronRight
                      size={15}
                      className="shrink-0 text-slate-350 dark:text-slate-700 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500 dark:group-hover:text-slate-400"
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
