import type { ScheduleStatus } from '../../types'
import { Badge } from './Badge'

const CONFIG: Record<ScheduleStatus, { label: string; tone: 'brand' | 'success' | 'warning' | 'danger' | 'neutral' }> = {
  planned: { label: 'Planned', tone: 'neutral' },
  in_progress: { label: 'In progress', tone: 'warning' },
  ready: { label: 'Ready', tone: 'brand' },
  posted: { label: 'Posted', tone: 'success' },
  skipped: { label: 'Skipped', tone: 'danger' },
}

export function StatusBadge({ status }: { status: ScheduleStatus }) {
  const cfg = CONFIG[status]
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>
}
