import { NavLink } from 'react-router-dom'
import { CalendarDays, LayoutDashboard, Layers, Rocket, Settings, Target } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { platformMeta } from '../../data/platforms'
import { nicheMeta } from '../../data/niches'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, end: false },
  { to: '/goals', label: 'Goals', icon: Target, end: false },
  { to: '/pillars', label: 'Content Pillars', icon: Layers, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

export function Sidebar() {
  const profile = useAppStore((s) => s.profile)

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-elevated)] md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--brand)] to-[var(--accent)] text-white">
          <Rocket size={16} />
        </div>
        <span className="text-base font-semibold tracking-tight">ContentPilot</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--brand-soft)] text-[var(--brand)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {profile && (
        <div className="mx-3 mb-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-3">
          <p className="truncate text-sm font-medium text-[var(--text)]">{profile.displayName}</p>
          <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
            {platformMeta(profile.platform).short} · {nicheMeta(profile.niche).label}
          </p>
        </div>
      )}
    </aside>
  )
}
