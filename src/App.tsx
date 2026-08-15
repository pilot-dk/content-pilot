import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import { useCloudSync } from './hooks/useCloudSync'
import { Onboarding } from './components/onboarding/Onboarding'
import { Shell } from './components/layout/Shell'
import { Dashboard } from './components/dashboard/Dashboard'
import { CalendarPage } from './components/calendar/CalendarPage'
import { GoalsPage } from './components/goals/GoalsPage'
import { PillarsPage } from './components/pillars/PillarsPage'
import { SettingsPage } from './components/settings/SettingsPage'

function useThemeEffect() {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    const apply = (isDark: boolean) => root.classList.toggle('dark', isDark)

    if (theme === 'dark') {
      apply(true)
      return
    }
    if (theme === 'light') {
      apply(false)
      return
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    apply(mq.matches)
    const listener = (e: MediaQueryListEvent) => apply(e.matches)
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [theme])
}

export default function App() {
  useThemeEffect()
  useCloudSync()
  const profile = useAppStore((s) => s.profile)

  if (!profile) {
    return <Onboarding />
  }

  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/pillars" element={<PillarsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
