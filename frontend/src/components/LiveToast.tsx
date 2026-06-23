import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { store } from '../store/store'
import type { Location } from '../types'

interface Item {
  key: number
  loc: Location
}

export default function LiveToast() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    let n = 0
    const unsub = store.subscribeLive((loc) => {
      const key = ++n
      setItems((s) => [...s, { key, loc }])
      setTimeout(() => setItems((s) => s.filter((i) => i.key !== key)), 3800)
    })
    return () => {
      unsub()
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-40 flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {items.map(({ key, loc }) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: -16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-sm text-white shadow-panel backdrop-blur"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span>
              Vừa có người chọn <b>{loc.name}</b>
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
