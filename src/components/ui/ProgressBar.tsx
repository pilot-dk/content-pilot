interface ProgressBarProps {
  pct: number
  color?: string
  height?: number
}

export function ProgressBar({ pct, color = 'var(--brand)', height = 8 }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div
      className="w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]"
      style={{ height }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  )
}
