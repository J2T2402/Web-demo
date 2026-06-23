import { useEffect, useState, useCallback } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import PublicPage from './pages/PublicPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import { useAuthed } from './store/auth'
import { init } from './store/store'

function AdminGate({ theme, toggleTheme }: { theme: 'light' | 'dark'; toggleTheme: () => void }) {
  const authed = useAuthed()
  return authed ? (
    <AdminDashboard theme={theme} toggleTheme={toggleTheme} />
  ) : (
    <AdminLogin theme={theme} toggleTheme={toggleTheme} />
  )
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved === 'light' || saved === 'dark') return saved
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      return next
    })
  }, [])

  useEffect(() => {
    // Tải dữ liệu từ API + kết nối realtime (tự fallback demo nếu backend chưa chạy).
    init()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PublicPage theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/admin" element={<AdminGate theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
