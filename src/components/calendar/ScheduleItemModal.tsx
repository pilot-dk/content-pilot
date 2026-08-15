import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import type { ScheduledItem, ScheduleStatus } from '../../types'
import { Modal } from '../ui/Modal'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'

const STATUS_OPTIONS: { value: ScheduleStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'ready', label: 'Ready to post' },
  { value: 'posted', label: 'Posted' },
  { value: 'skipped', label: 'Skipped' },
]

interface Props {
  onClose: () => void
  existing?: ScheduledItem
  initialDate?: string
  initialTime?: string
  initialPillarId?: string | null
  initialTitle?: string
}

export function ScheduleItemModal({ onClose, existing, initialDate, initialTime, initialPillarId, initialTitle }: Props) {
  const pillars = useAppStore((s) => s.pillars)
  const addItem = useAppStore((s) => s.addItem)
  const updateItem = useAppStore((s) => s.updateItem)
  const removeItem = useAppStore((s) => s.removeItem)

  const [title, setTitle] = useState(existing?.title ?? initialTitle ?? '')
  const [date, setDate] = useState(existing?.date ?? initialDate ?? new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState(existing?.time ?? initialTime ?? '18:00')
  const [pillarId, setPillarId] = useState<string>(existing?.pillarId ?? initialPillarId ?? pillars[0]?.id ?? '')
  const [status, setStatus] = useState<ScheduleStatus>(existing?.status ?? 'planned')
  const [notes, setNotes] = useState(existing?.notes ?? '')

  const canSave = title.trim().length > 0 && date

  const save = () => {
    if (!canSave) return
    if (existing) {
      updateItem(existing.id, { title: title.trim(), date, time, pillarId: pillarId || null, status, notes })
    } else {
      addItem({ title: title.trim(), date, time, pillarId: pillarId || null, status, notes })
    }
    onClose()
  }

  const del = () => {
    if (existing) removeItem(existing.id)
    onClose()
  }

  return (
    <Modal
      title={existing ? 'Edit scheduled video' : 'Schedule a video'}
      onClose={onClose}
      footer={
        <div className="flex w-full items-center justify-between">
          {existing ? (
            <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={del}>
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button size="md" onClick={save} disabled={!canSave}>
              {existing ? 'Save changes' : 'Add to schedule'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Title / working idea">
          <Input autoFocus placeholder="e.g. Top 5 beginner mistakes" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Time">
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
        </div>
        <Field label="Content pillar">
          <Select value={pillarId} onChange={(e) => setPillarId(e.target.value)}>
            <option value="">No pillar</option>
            {pillars.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value as ScheduleStatus)}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Notes (optional)">
          <Textarea rows={2} placeholder="Hooks, references, links..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
      </div>
    </Modal>
  )
}
