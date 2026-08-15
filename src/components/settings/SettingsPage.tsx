import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { PLATFORMS } from '../../data/platforms'
import { NICHES } from '../../data/niches'
import type { Niche, Platform } from '../../types'
import { Topbar } from '../layout/Topbar'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Field, Input, Select } from '../ui/Field'
import { Modal } from '../ui/Modal'

export function SettingsPage() {
  const profile = useAppStore((s) => s.profile)
  const updateProfile = useAppStore((s) => s.updateProfile)
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const resetAll = useAppStore((s) => s.resetAll)
  const loadSnapshot = useAppStore((s) => s.loadSnapshot)

  const [confirmReset, setConfirmReset] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!profile) return null

  const exportData = () => {
    const snapshot = useAppStore.getState()
    const payload = {
      profile: snapshot.profile,
      pillars: snapshot.pillars,
      items: snapshot.items,
      goals: snapshot.goals,
      theme: snapshot.theme,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contentpilot-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (file: File) => {
    setImportError(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!parsed.profile || !Array.isArray(parsed.pillars) || !Array.isArray(parsed.items) || !Array.isArray(parsed.goals)) {
          throw new Error('This file is missing required ContentPilot data.')
        }
        loadSnapshot({
          profile: parsed.profile,
          pillars: parsed.pillars,
          items: parsed.items,
          goals: parsed.goals,
          theme: parsed.theme ?? 'system',
        })
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Could not read that file.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div>
      <Topbar title="Settings" subtitle="Manage your profile, theme, and data." />

      <div className="max-w-2xl space-y-5 p-5 md:p-8">
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-[var(--text)]">Profile</h3>
          <div className="mt-4 space-y-4">
            <Field label="Display name">
              <Input value={profile.displayName} onChange={(e) => updateProfile({ displayName: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Primary platform">
                <Select value={profile.platform} onChange={(e) => updateProfile({ platform: e.target.value as Platform })}>
                  {PLATFORMS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.short}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Niche">
                <Select value={profile.niche} onChange={(e) => updateProfile({ niche: e.target.value as Niche })}>
                  {NICHES.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label={`Weekly upload goal — ${profile.weeklyUploadGoal}/week`}>
              <input
                type="range"
                min={1}
                max={14}
                value={profile.weeklyUploadGoal}
                onChange={(e) => updateProfile({ weeklyUploadGoal: Number(e.target.value) })}
                className="w-full accent-[var(--brand)]"
              />
            </Field>
            <Field label="Timezone">
              <Input value={profile.timezone} onChange={(e) => updateProfile({ timezone: e.target.value })} />
            </Field>
          </div>
        </Card>

        <Card padding="lg">
          <h3 className="text-sm font-semibold text-[var(--text)]">Appearance</h3>
          <div className="mt-3 inline-flex rounded-xl border border-[var(--border)] p-1">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                  theme === t ? 'bg-[var(--brand)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <h3 className="text-sm font-semibold text-[var(--text)]">Your data</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Everything is stored locally in this browser. Export a backup or move it to another device.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" size="md" icon={<Download size={15} />} onClick={exportData}>
              Export backup
            </Button>
            <Button variant="secondary" size="md" icon={<Upload size={15} />} onClick={() => fileInputRef.current?.click()}>
              Import backup
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) importData(file)
                e.target.value = ''
              }}
            />
          </div>
          {importError && <p className="mt-2 text-xs text-[var(--danger)]">{importError}</p>}
        </Card>

        <Card padding="lg" className="border-[var(--danger)]/30">
          <h3 className="text-sm font-semibold text-[var(--danger)]">Danger zone</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Erase your profile, schedule, pillars, and goals from this browser.</p>
          <div className="mt-4">
            <Button variant="danger" size="md" onClick={() => setConfirmReset(true)}>
              Reset all data
            </Button>
          </div>
        </Card>
      </div>

      {confirmReset && (
        <Modal
          title="Reset all data?"
          onClose={() => setConfirmReset(false)}
          footer={
            <>
              <Button variant="secondary" size="md" onClick={() => setConfirmReset(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  resetAll()
                  setConfirmReset(false)
                }}
              >
                Yes, erase everything
              </Button>
            </>
          }
        >
          <p className="text-sm text-[var(--text-muted)]">
            This permanently deletes your profile, content pillars, scheduled videos, and goals from this browser. This
            can't be undone — export a backup first if you want to keep a copy.
          </p>
        </Modal>
      )}
    </div>
  )
}
