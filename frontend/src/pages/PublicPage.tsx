import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ListFilter, X } from 'lucide-react'
import type { Location } from '../types'
import { useLocations } from '../store/store'
import TopBar from '../components/TopBar'
import MapView from '../components/MapView'
import Legend from '../components/Legend'
import SearchPanel from '../components/SearchPanel'
import ClaimModal from '../components/ClaimModal'
import SuccessOverlay from '../components/SuccessOverlay'
import LiveToast from '../components/LiveToast'

export default function PublicPage({ theme, toggleTheme }: { theme: 'light' | 'dark'; toggleTheme: () => void }) {
  const locations = useLocations()
  const ownedCount = locations.filter((l) => l.status === 'owned').length
  const reduced = !!useReducedMotion()

  const [selected, setSelected] = useState<Location | null>(null)
  const [success, setSuccess] = useState<Location | null>(null)
  const [highlightId, setHighlightId] = useState<number | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const transformRef = useRef<any>(null)
  const highlightTimer = useRef<ReturnType<typeof setTimeout>>()

  const flyTo = useCallback((id: number) => {
    setHighlightId(id)
    setSheetOpen(false)
    // chờ sheet đóng (mobile) rồi mới "bay" tới ghim
    setTimeout(() => {
      transformRef.current?.zoomToElement(`pin-${id}`, 3.4, 650)
    }, 60)
    clearTimeout(highlightTimer.current)
    highlightTimer.current = setTimeout(() => setHighlightId(null), 2600)
  }, [])

  const selectFromList = useCallback(
    (loc: Location) => {
      flyTo(loc.id)
      setSelected(loc)
    },
    [flyTo],
  )

  const handleSuccess = useCallback((loc: Location) => {
    setSelected(null)
    setSuccess(loc)
  }, [])

  return (
    <div className={`flex h-full flex-col ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <TopBar ownedCount={ownedCount} total={locations.length} theme={theme} toggleTheme={toggleTheme} />

      <div className="relative flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          <MapView
            locations={locations}
            transformRef={transformRef}
            highlightId={highlightId}
            reduced={reduced}
            onPinSelect={setSelected}
            theme={theme}
          />
          <Legend theme={theme} />
        </div>

        <aside className="hidden w-80 shrink-0 border-l border-slate-200/30 dark:border-white/5 bg-white/40 dark:bg-slate-950/40 lg:block">
          <SearchPanel locations={locations} onFly={flyTo} onSelect={selectFromList} theme={theme} />
        </aside>
      </div>

      {/* Bộ lọc dạng bottom-sheet trên mobile */}
      <div className="lg:hidden">
        {!sheetOpen && (
          <button
            onClick={() => setSheetOpen(true)}
            className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-panel active:scale-95"
          >
            <ListFilter size={18} /> Danh sách địa danh
          </button>
        )}
        <AnimatePresence>
          {sheetOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSheetOpen(false)}
              />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-50 flex h-[72vh] flex-col overflow-hidden rounded-t-3xl bg-white dark:bg-slate-900 shadow-panel border-t border-slate-150 dark:border-slate-800"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-white dark:bg-slate-900">
                  <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <button
                    onClick={() => setSheetOpen(false)}
                    aria-label="Đóng"
                    className="absolute right-3 grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="min-h-0 flex-1 bg-white/40 dark:bg-slate-950/40">
                  <SearchPanel locations={locations} onFly={flyTo} onSelect={selectFromList} theme={theme} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selected && (
          <ClaimModal
            key={selected.id}
            location={selected}
            onClose={() => setSelected(null)}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <SuccessOverlay
            location={success}
            onClose={() => setSuccess(null)}
            onViewOnMap={() => {
              const id = success.id
              setSuccess(null)
              flyTo(id)
            }}
          />
        )}
      </AnimatePresence>

      <LiveToast />
    </div>
  )
}
