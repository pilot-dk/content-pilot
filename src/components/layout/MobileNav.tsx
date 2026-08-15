import { NavLink } from 'react-router-dom'
import { CalendarDays, LayoutDashboard, Layers, Settings, Target } from 'lucide-react'

const NAV = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, end: false },
  { to: '/goals', label: 'Goals', icon: Target, end: false },
  { to: '/pillars', label: 'Pillars', icon: Layers, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--border)] bg-[var(--bg-elevated)]/95 backdrop-blur md:hidden">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${
              isActive ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]'
            }`
          }
        >
          <Icon size={19} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
