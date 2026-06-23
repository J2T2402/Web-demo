import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Check, MapPin } from 'lucide-react'
import type { Location } from '../types'

interface Props {
  location: Location
  onClose: () => void
  onViewOnMap: () => void
}

export default function SuccessOverlay({ location, onClose, onViewOnMap }: Props) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const fire = (particleRatio: number, opts: Record<string, unknown>) =>
      confetti({
        origin: { y: 0.45 },
        spread: 70,
        startVelocity: 45,
        particleCount: Math.floor(220 * particleRatio),
        colors: ['#10b981', '#4f46e5', '#f59e0b', '#ef4444', '#06b6d4'],
        ...opts,
      })
    fire(0.25, { spread: 26, startVelocity: 55 })
    fire(0.35, { spread: 90 })
    fire(0.2, { spread: 120, decay: 0.92, scalar: 1.2 })
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        className="w-full max-w-sm overflow-hidden rounded-3xl p-7 text-center shadow-2xl border border-slate-200/40 dark:border-white/10 bg-white/90 dark:bg-slate-950/85 backdrop-blur-2xl"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <motion.div
          className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
        >
          <Check size={44} strokeWidth={3} />
        </motion.div>

        <h2 className="mt-5 text-2xl font-black text-slate-800 dark:text-slate-100">Chúc mừng! 🎉</h2>
        <p className="mt-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Bạn đã sở hữu thành công địa danh
        </p>
        <p className="mt-1.5 flex items-center justify-center gap-1.5 text-lg font-black text-red-600 dark:text-amber-500 glow-amber-text">
          <MapPin size={18} /> {location.name}
        </p>

        <div className="mt-7 flex flex-col gap-2.5">
          <button
            onClick={onViewOnMap}
            className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 dark:from-amber-500 dark:to-orange-500 py-3 font-extrabold text-white dark:text-slate-950 shadow-lg shadow-red-500/10 dark:shadow-amber-500/5 transition-all duration-300 hover:brightness-105 active:scale-[0.98]"
          >
            Xem trên bản đồ
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-100/50 dark:bg-slate-900/60 border border-slate-200/30 dark:border-white/5 py-3 font-bold text-slate-600 dark:text-slate-400 transition hover:bg-slate-200/50 dark:hover:bg-slate-800"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
