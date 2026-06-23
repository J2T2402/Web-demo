import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react'
import { auth } from '../store/auth'

export default function AdminLogin({ theme, toggleTheme }: { theme: 'light' | 'dark'; toggleTheme: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const ok = await auth.login(username, password)
      if (!ok) setError('Sai tên đăng nhập hoặc mật khẩu.')
    } catch {
      setError('Không kết nối được máy chủ. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-full items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300 overflow-hidden">
      {/* Background glowing blobs for premium feel */}
      <div className="bg-blob w-72 h-72 bg-red-500 top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
      <div className="bg-blob w-80 h-80 bg-amber-500 bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 animate-glow-pulse" style={{ animationDelay: '1.5s' }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-slate-200/40 dark:border-white/10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl relative z-10"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20 dark:shadow-red-600/10">
          <ShieldCheck size={28} />
        </div>
        <h1 className="mt-4 text-center text-2xl font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-orange-500 dark:from-red-500 dark:to-yellow-400 bg-clip-text text-transparent">
          Đăng nhập quản trị
        </h1>
        <p className="mt-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Khu vực dành cho ban tổ chức sự kiện
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">Tên đăng nhập</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              className="w-full glass-input px-3.5 py-3 text-base"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">Mật khẩu</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full glass-input px-3.5 py-3 text-base"
            />
          </label>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 px-3.5 py-2.5 text-sm font-bold text-rose-600 dark:text-rose-350 border border-rose-500/20 dark:border-rose-500/35">
              <AlertCircle size={18} className="shrink-0" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 dark:from-amber-500 dark:to-orange-500 py-3.5 font-bold text-white dark:text-slate-950 shadow-lg shadow-red-500/10 dark:shadow-amber-500/5 transition-all duration-300 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>

        <Link
          to="/"
          className="mt-5 flex items-center justify-center gap-1.5 text-sm font-bold text-slate-500 dark:text-slate-400 transition hover:text-red-600 dark:hover:text-amber-500 hover:scale-105"
        >
          <ArrowLeft size={16} /> Về trang bản đồ
        </Link>
      </motion.div>
    </div>
  )
}
