import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import type { Goal, GoalPeriod, GoalType } from '../../types'
import { currentPeriodKey } from '../../lib/goals'
import { Modal } from '../ui/Modal'
import { Field, Input, Select } from '../ui/Field'
import { Button } from '../ui/Button'

const TYPE_OPTIONS: { value: GoalType; label: string; unit: string }[] = [
  { value: 'uploads', label: 'Videos published', unit: 'videos' },
  { value: 'subscribers', label: 'New subscribers/followers', unit: 'subs' },
  { value: 'views', label: 'Views', unit: 'views' },
  { value: 'watch_hours', label: 'Watch hours', unit: 'hours' },
  { value: 'revenue', label: 'Revenue', unit: '$' },
  { value: 'custom', label: 'Custom', unit: '' },
]

export function GoalModal({ onClose, existing, defaultPeriod }: { onClose: () => void; existing?: Goal; defaultPeriod: GoalPeriod }) {
  const addGoal = useAppStore((s) => s.addGoal)
  const updateGoal = useAppStore((s) => s.updateGoal)
  const removeGoal = useAppStore((s) => s.removeGoal)
  const now = new Date()

  const [period, setPeriod] = useState<GoalPeriod>(existing?.period ?? defaultPeriod)
  const [periodKey, setPeriodKey] = useState(existing?.periodKey ?? currentPeriodKey(defaultPeriod, now))
  const [type, setType] = useState<GoalType>(existing?.type ?? 'uploads')
  const [label, setLabel] = useState(existing?.label ?? TYPE_OPTIONS[0].label)
  const [target, setTarget] = useState(existing?.target ?? 10)
  const [current, setCurrent] = useState(existing?.current ?? 0)
  const [unit, setUnit] = useState(existing?.unit ?? TYPE_OPTIONS[0].unit)

  const canSave = label.trim().length > 0 && target > 0 && periodKey.trim().length > 0

  const onTypeChange = (t: GoalType) => {
    setType(t)
    const opt = TYPE_OPTIONS.find((o) => o.value === t)
    if (opt) {
      setLabel(opt.label)
      setUnit(opt.unit)
    }
  }

  const save = () => {
    if (!canSave) return
    const payload = { period, periodKey: periodKey.trim(), type, label: label.trim(), target, current, unit }
    if (existing) {
      updateGoal(existing.id, payload)
    } else {
      addGoal(payload)
    }
    onClose()
  }

  const del = () => {
    if (existing) removeGoal(existing.id)
    onClose()
  }

  return (
    <Modal
      title={existing ? 'Edit goal' : 'New goal'}
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
              {existing ? 'Save changes' : 'Add goal'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Period">
            <Select
              value={period}
              onChange={(e) => {
                const p = e.target.value as GoalPeriod
                setPeriod(p)
                setPeriodKey(currentPeriodKey(p, now))
              }}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </Field>
          <Field label={period === 'monthly' ? 'Month (yyyy-MM)' : 'Year (yyyy)'}>
            <Input value={periodKey} onChange={(e) => setPeriodKey(e.target.value)} />
          </Field>
        </div>

        <Field label="Goal type">
          <Select value={type} onChange={(e) => onTypeChange(e.target.value as GoalType)}>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Label">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Target">
            <Input type="number" min={1} value={target} onChange={(e) => setTarget(Number(e.target.value))} />
          </Field>
          <Field label="Unit">
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
          </Field>
        </div>

        {type !== 'uploads' && (
          <Field label="Current progress" hint="Update this as you track results manually.">
            <Input type="number" min={0} value={current} onChange={(e) => setCurrent(Number(e.target.value))} />
          </Field>
        )}
        {type === 'uploads' && (
          <p className="text-xs text-[var(--text-faint)]">
            Progress for "Videos published" is calculated automatically from items marked Posted in your schedule.
          </p>
        )}
      </div>
    </Modal>
  )
}
