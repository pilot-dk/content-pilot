import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }

export function Card({ children, padding = 'md', className = '', ...rest }: CardProps) {
  return (
    <div
      className={`card-shadow rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] ${paddings[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
