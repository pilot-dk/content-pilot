import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import type { ContentPillar } from '../../types'
import { colorForIndex } from '../../data/pillars'
import { Modal } from '../ui/Modal'
import { Field, Input, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'

const SWATCHES = ['#7c5cff', '#ff5ca8', '#17b26a', '#f79009', '#2dd4ee', '#f04438', '#0a66c2', '#8e44ad']

export function PillarModal({ onClose, existing }: { onClose: () => void; existing?: ContentPillar }) {
  const pillars = useAppStore((s) => s.pillars)
  const addPillar = useAppStore((s) => s.addPillar)
  const updatePillar = useAppStore((s) => s.updatePillar)
  const removePillar = useAppStore((s) => s.removePillar)

  const [name, setName] = useState(existing?.name ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [weight, setWeight] = useState(existing?.weight ?? 3)
  const [color, setColor] = useState(existing?.color ?? colorForIndex(pillars.length))

  const canSave = name.trim().length > 0

  const save = () => {
    if (!canSave) return
    if (existing) {
      updatePillar(existing.id, { name: name.trim(), description: description.trim(), weight, color })
    } else {
      addPillar({ name: name.trim(), description: description.trim(), weight, color })
    }
    onClose()
  }

  const del = () => {
    if (existing) removePillar(existing.id)
    onClose()
  }

  return (
    <Modal
      title={existing ? 'Edit content pillar' : 'New content pillar'}
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
              {existing ? 'Save changes' : 'Add pillar'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Name">
          <Input autoFocus placeholder="e.g. Tutorial" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Description">
          <Textarea rows={2} placeholder="What this content type covers" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label={`Rotation priority — ${weight}/5`} hint="Higher priority pillars get suggested more often.">
          <input
            type="range"
            min={1}
            max={5}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full accent-[var(--brand)]"
          />
        </Field>
        <Field label="Color">
          <div className="flex flex-wrap gap-2">
            {SWATCHES.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="h-7 w-7 rounded-full ring-offset-2 ring-offset-[var(--bg-elevated)]"
                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
                aria-label={c}
              />
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  )
}
