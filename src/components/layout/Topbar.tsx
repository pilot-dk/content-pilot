import { Moon, Sun, SunMoon } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import type { Theme } from '../../store/useAppStore'

const THEME_ORDER: Theme[] = ['light', 'dark', 'system']
const THEME_ICON = { light: Sun, dark: Moon, system: SunMoon }

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const Icon = THEME_ICON[theme]

  const cycleTheme = () => {
    const idx = THEME_ORDER.indexOf(theme)
    setTheme(THEME_ORDER[(idx + 1) % THEME_ORDER.length])
  }

  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-elevated)]/70 px-5 py-4 backdrop-blur md:px-8">
      <div>
        <h1 className="text-lg font-semibold text-[var(--text)]">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-[var(--text-muted)]">{subtitle}</p>}
      </div>
      <button
        onClick={cycleTheme}
        className="rounded-xl border border-[var(--border)] p-2 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]"
        title={`Theme: ${theme}`}
        aria-label="Toggle theme"
      >
        <Icon size={17} />
      </button>
    </header>
  )
}
