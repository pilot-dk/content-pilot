import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  color?: string
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral'
}

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  brand: 'bg-[var(--brand-soft)] text-[var(--brand)]',
  success: 'bg-[var(--success-soft)] text-[var(--success)]',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning)]',
  danger: 'bg-[var(--danger-soft)] text-[var(--danger)]',
  neutral: 'bg-[var(--bg-subtle)] text-[var(--text-muted)]',
}

export function Badge({ children, color, tone = 'neutral' }: BadgeProps) {
  if (color) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
        style={{ backgroundColor: `${color}1a`, color }}
      >
        {children}
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  )
}
