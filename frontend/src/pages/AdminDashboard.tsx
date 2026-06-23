import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  LogOut,
  Map as MapIcon,
  Search,
  Pencil,
  Check,
  X,
  Users,
  CircleCheck,
  CircleDashed,
  Eye,
  Sun,
  Moon,
} from 'lucide-react'
import { useAdminLocations, adminStore } from '../store/admin'
import { store } from '../store/store'
import { auth } from '../store/auth'
import { formatPhone } from '../lib/phone'
import { formatTime, deAccent } from '../lib/format'
import type { Location } from '../types'

type FilterKey = 'all' | 'available' | 'owned'

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  tone: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-soft ring-1 ring-slate-900/5 dark:ring-white/5 transition-colors duration-300">
      <div className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}>{icon}</div>
      <div>
        <p className="text-2xl font-extrabold leading-none text-slate-800 dark:text-slate-100">{value}</p>
        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  )
}

interface AdminProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export default function AdminDashboard({ theme, toggleTheme }: AdminProps) {
  const locations = useAdminLocations()
  // Tải danh sách (kèm PII) khi vào trang; tự refresh khi có người vừa chọn ghim (realtime).
  useEffect(() => {
    adminStore.refresh()
    const unsub = store.subscribeLive(() => adminStore.refresh())
    return () => {
      unsub()
    }
  }, [])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  const ownedCount = locations.filter((l) => l.status === 'owned').length
  const availableCount = locations.length - ownedCount
  const pct = locations.length ? Math.round((ownedCount / locations.length) * 100) : 0

  const rows = useMemo(() => {
    const q = deAccent(query.trim())
    return locations.filter((l) => {
      if (filter !== 'all' && l.status !== filter) return false
      if (!q) return true
      return (
        deAccent(l.name).includes(q) ||
        deAccent(l.province).includes(q) ||
        (l.owner ? deAccent(l.owner.fullName).includes(q) || l.owner.phone.includes(q) : false)
      )
    })
  }, [locations, query, filter])

  const startEdit = (l: Location) => {
    setEditId(l.id)
    setEditName(l.name)
  }
  const saveEdit = () => {
    if (editId != null && editName.trim()) {
      adminStore.updateName(editId, editName)
    }
    setEditId(null)
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/40 dark:border-white/5 bg-white/70 dark:bg-slate-950/70 px-4 py-4 backdrop-blur-lg md:px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/15 dark:shadow-red-600/5 border border-red-400/25">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-base font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-orange-500 dark:from-red-500 dark:to-yellow-400 bg-clip-text text-transparent md:text-lg">Trang quản trị</h1>
            <p className="hidden text-[11px] font-semibold text-slate-500 dark:text-slate-400 sm:block tracking-wide">Quản lý địa danh & người tham gia</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Nút chuyển đổi sáng tối trong quản trị */}
          <button
            onClick={toggleTheme}
            aria-label="Chuyển chế độ sáng tối"
            className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-white/10 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-amber-400 hover:scale-105 active:scale-95 shadow-sm transition-all duration-200"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/60 border border-slate-200/30 dark:border-white/5 px-4 py-2.2 text-sm font-bold text-slate-600 dark:text-slate-300 transition-all duration-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 shadow-sm"
          >
            <MapIcon size={16} /> <span className="hidden sm:inline">Bản đồ</span>
          </Link>
          <button
            onClick={() => auth.logout()}
            className="flex items-center gap-1.5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-red-600 dark:hover:bg-amber-500 dark:hover:text-slate-950 hover:scale-105 active:scale-95 px-4 py-2.2 text-sm font-bold transition-all duration-200 shadow-md shadow-slate-950/10 dark:shadow-white/5 border border-transparent hover:border-red-400/20"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        {/* Thống kê */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat icon={<MapIcon size={20} />} label="Tổng địa danh" value={locations.length} tone="bg-indigo-500/10 text-indigo-600 dark:text-indigo-300" />
          <Stat icon={<CircleCheck size={20} />} label="Đã có người chọn" value={ownedCount} tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" />
          <Stat icon={<CircleDashed size={20} />} label="Còn trống" value={availableCount} tone="bg-slate-500/10 text-slate-600 dark:text-slate-300" />
          <Stat icon={<Users size={20} />} label="Tỉ lệ lấp đầy" value={`${pct}%`} tone="bg-amber-500/10 text-amber-600 dark:text-amber-300 glow-amber" />
        </div>

        <div className="flex items-start gap-2.5 rounded-2xl px-4 py-3.5 text-sm transition-all duration-300 border border-indigo-200/40 dark:border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-300">
          <Eye size={18} className="mt-0.5 shrink-0 text-indigo-500" />
          <span className="font-medium">
            Trang quản trị hiển thị <b className="font-extrabold text-indigo-800 dark:text-indigo-200">đầy đủ họ tên và số điện thoại</b> của khách hàng. Ở giao
            diện người dùng, thông tin này được <b className="font-extrabold text-emerald-700 dark:text-emerald-300">ẩn danh</b> hoàn toàn để bảo vệ quyền riêng tư.
          </span>
        </div>

        {/* Bộ lọc */}
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo địa danh, tỉnh, khách hàng, SĐT…"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-11 pr-3.5 text-sm outline-none transition-all duration-300 focus:border-red-500 dark:focus:border-amber-500 focus:ring-4 focus:ring-red-500/10 dark:focus:ring-amber-500/10 text-slate-850 dark:text-slate-100"
            />
          </div>
          <div className="flex gap-2 p-1 rounded-xl bg-slate-100/50 dark:bg-slate-900/60 border border-slate-200/30 dark:border-white/5">
            {(['all', 'owned', 'available'] as FilterKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all duration-300 ${
                  filter === k
                    ? theme === 'dark'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/40'
                }`}
              >
                {k === 'all' ? 'Tất cả' : k === 'owned' ? 'Đã chọn' : 'Còn trống'}
              </button>
            ))}
          </div>
        </div>

        {/* Bảng */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/30 dark:border-white/5 bg-white/70 dark:bg-slate-950/40 backdrop-blur-md shadow-xl">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-100/50 dark:bg-slate-900/40 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/30 dark:border-white/5">
                <tr>
                  <th className="px-5 py-4 font-bold">#</th>
                  <th className="px-5 py-4 font-bold">Địa danh</th>
                  <th className="px-5 py-4 font-bold">Tỉnh / TP</th>
                  <th className="px-5 py-4 font-bold">Trạng thái</th>
                  <th className="px-5 py-4 font-bold">Khách hàng</th>
                  <th className="px-5 py-4 font-bold">Số điện thoại</th>
                  <th className="px-5 py-4 font-bold">Thời gian</th>
                  <th className="px-5 py-4 text-right font-bold">Sửa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-white/5 font-medium text-slate-700 dark:text-slate-300">
                {rows.map((l) => {
                  const editing = editId === l.id
                  return (
                    <tr key={l.id} className="transition-colors duration-150 hover:bg-white/40 dark:hover:bg-slate-900/20">
                      <td className="px-5 py-4 font-bold text-slate-400 dark:text-slate-500">{l.id}</td>
                      <td className="px-5 py-4 font-bold text-slate-900 dark:text-slate-100">
                        {editing ? (
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full min-w-[180px] rounded-lg border border-red-350 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-sm outline-none focus:ring-4 focus:ring-red-500/10 dark:focus:ring-amber-500/10 focus:border-red-500 dark:focus:border-amber-500 text-slate-850 dark:text-slate-100"
                          />
                        ) : (
                          l.name
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{l.province}</td>
                      <td className="px-5 py-4">
                        {l.status === 'owned' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-750">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Đã chọn
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Còn trống
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-800 dark:text-slate-200 font-semibold">{l.owner?.fullName ?? '—'}</td>
                      <td className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300">
                        {l.owner ? formatPhone(l.owner.phone) : '—'}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 dark:text-slate-500">
                        {l.owner ? formatTime(l.owner.claimedAt) : '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {editing ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={saveEdit}
                              aria-label="Lưu"
                              className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-sm active:scale-95"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              aria-label="Hủy"
                              className="grid h-8 w-8 place-items-center rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition active:scale-95"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(l)}
                            aria-label="Sửa tên địa danh"
                            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-red-500/10 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-amber-400 active:scale-95"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500 font-semibold">
                      Không có địa danh phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
