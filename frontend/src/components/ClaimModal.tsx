import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X, MapPin, User, Phone, AlertCircle } from 'lucide-react'
import type { Location } from '../types'
import { store } from '../store/store'
import { isValidVNPhone } from '../lib/phone'

interface Props {
  location: Location
  onClose: () => void
  onSuccess: (loc: Location) => void
}

const REASON_MSG: Record<string, string> = {
  taken: 'Rất tiếc, địa danh này vừa được người khác chọn. Mời bạn chọn địa danh khác nhé!',
  duplicate: 'Số điện thoại này đã sở hữu một địa danh rồi. Mỗi số chỉ được chọn 1 địa danh.',
  notfound: 'Không tìm thấy địa danh. Vui lòng thử lại.',
}

export default function ClaimModal({ location, onClose, onSuccess }: Props) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (fullName.trim().length < 2) {
      setError('Vui lòng nhập họ tên của bạn.')
      return
    }
    if (!isValidVNPhone(phone)) {
      setError('Số điện thoại không hợp lệ (VD: 0901 234 567).')
      return
    }
    setSubmitting(true)
    try {
      const res = await store.claim(location.id, fullName, phone)
      if (res.ok) {
        onSuccess(location)
      } else {
        setError(REASON_MSG[res.reason] ?? 'Có lỗi xảy ra, vui lòng thử lại.')
      }
    } catch {
      setError('Không kết nối được máy chủ. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-md sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-title"
    >
      <motion.div
        className="w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/40 dark:border-white/10 bg-white/90 dark:bg-slate-950/85 backdrop-blur-2xl"
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-r from-red-600 to-orange-500 dark:from-amber-500 dark:to-orange-600 px-6 pb-6 pt-7 text-white dark:text-slate-950">
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/15 dark:bg-black/10 transition hover:bg-white/25 dark:hover:bg-black/20"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-white/80 dark:text-slate-900/80">
            <MapPin size={14} /> Địa danh #{location.id}
          </div>
          <h2 id="claim-title" className="mt-1 text-2xl font-black leading-tight">
            {location.name}
          </h2>
          <p className="mt-0.5 text-sm font-semibold text-white/80 dark:text-slate-900/80">{location.province}</p>
        </div>

        <form onSubmit={submit} className="space-y-4.5 p-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Điền thông tin để xác nhận sở hữu địa danh này. Thông tin của bạn được
            bảo mật và <span className="text-red-500 dark:text-amber-500 font-bold">ẩn danh</span> với người khác.
          </p>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">Họ và tên</span>
            <div className="relative">
              <User size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={nameRef}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full glass-input py-3 pl-11 pr-3.5 text-base"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">Số điện thoại</span>
            <div className="relative">
              <Phone size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                inputMode="numeric"
                placeholder="0901 234 567"
                className="w-full glass-input py-3 pl-11 pr-3.5 text-base"
              />
            </div>
          </label>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 px-3.5 py-3 text-sm font-semibold text-rose-600 dark:text-rose-300 border border-rose-500/20 dark:border-rose-500/35"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 dark:from-amber-500 dark:to-orange-500 py-3.5 text-base font-bold text-white dark:text-slate-950 shadow-lg shadow-red-500/15 dark:shadow-amber-500/10 transition-all duration-300 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 dark:border-slate-900/40 border-t-white dark:border-t-slate-900" />
                Đang xác nhận…
              </>
            ) : (
              'Xác nhận sở hữu'
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}
