import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { PLATFORMS } from '../../data/platforms'
import { NICHES } from '../../data/niches'
import { defaultPillarsFor } from '../../data/pillars'
import type { Niche, Platform } from '../../types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Field, Input } from '../ui/Field'

const STEP_LABELS = ['You', 'Platform', 'Niche', 'Cadence', 'Review']

export function Onboarding() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding)
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [niche, setNiche] = useState<Niche | null>(null)
  const [weeklyUploadGoal, setWeeklyUploadGoal] = useState(3)
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, [])

  const previewPillars = niche ? defaultPillarsFor(niche) : []

  const canNext =
    (step === 0 && displayName.trim().length > 0) ||
    (step === 1 && platform !== null) ||
    (step === 2 && niche !== null) ||
    step === 3 ||
    step === 4

  const finish = () => {
    if (!platform || !niche) return
    completeOnboarding({
      displayName: displayName.trim(),
      platform,
      niche,
      weeklyUploadGoal,
      timezone,
      createdAt: new Date().toISOString(),
    })
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--accent)] text-white">
            <Rocket size={18} />
          </div>
          <span className="text-xl font-semibold tracking-tight text-[var(--text)]">ContentPilot</span>
        </div>

        <div className="mb-6 flex items-center justify-center gap-2">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                  i <= step ? 'bg-[var(--brand)] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-faint)]'
                }`}
              >
                {i + 1}
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`h-0.5 w-6 rounded ${i < step ? 'bg-[var(--brand)]' : 'bg-[var(--bg-subtle)]'}`} />
              )}
            </div>
          ))}
        </div>

        <Card padding="lg">
          {step === 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">Welcome — let's set up your studio</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                A few quick questions so ContentPilot can tailor your posting schedule, content ideas, and goals.
              </p>
              <div className="mt-5">
                <Field label="What should we call you / your channel?">
                  <Input
                    autoFocus
                    placeholder="e.g. Jordan Media"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">What platform do you focus on?</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">This drives your best-time-to-post recommendations.</p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors ${
                      platform === p.id
                        ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
                        : 'border-[var(--border)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <span className="text-xl">{p.emoji}</span>
                    <span className="text-sm font-medium text-[var(--text)]">{p.short}</span>
                    <span className="text-xs text-[var(--text-muted)]">{p.formatHint}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">What's your content niche?</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">We'll suggest content pillars and timing tuned to this audience.</p>
              <div className="mt-5 grid max-h-80 grid-cols-2 gap-3 overflow-y-auto scrollbar-thin pr-1 sm:grid-cols-3">
                {NICHES.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setNiche(n.id)}
                    className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors ${
                      niche === n.id
                        ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
                        : 'border-[var(--border)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <span className="text-xl">{n.emoji}</span>
                    <span className="text-sm font-medium text-[var(--text)]">{n.label}</span>
                    <span className="text-xs text-[var(--text-muted)]">{n.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">How consistent do you want to be?</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Set a weekly upload target. We'll build your streaks and monthly/yearly goals from this.
              </p>
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text)]">Videos per week</span>
                  <span className="text-2xl font-semibold text-[var(--brand)]">{weeklyUploadGoal}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={14}
                  value={weeklyUploadGoal}
                  onChange={(e) => setWeeklyUploadGoal(Number(e.target.value))}
                  className="w-full accent-[var(--brand)]"
                />
                <div className="mt-1 flex justify-between text-xs text-[var(--text-faint)]">
                  <span>1 / week</span>
                  <span>Daily</span>
                  <span>2x / day</span>
                </div>
              </div>
              <div className="mt-6 rounded-xl bg-[var(--bg-subtle)] p-3 text-xs text-[var(--text-muted)]">
                Detected timezone: <span className="font-medium text-[var(--text)]">{timezone}</span> — used to schedule
                posting times. You can change this later in Settings.
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">Your starter content pillars</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Based on your niche, here's a rotation of content types to keep things varied. Edit anytime in
                Content Pillars.
              </p>
              <div className="mt-4 space-y-2">
                {previewPillars.map((p) => (
                  <div key={p.name} className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">{p.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{p.description}</p>
                    </div>
                    <span className="text-xs font-medium text-[var(--text-faint)]">Priority {p.weight}/5</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              size="md"
              icon={<ArrowLeft size={16} />}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < STEP_LABELS.length - 1 ? (
              <Button size="md" icon={<ArrowRight size={16} />} className="flex-row-reverse" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                Continue
              </Button>
            ) : (
              <Button size="md" onClick={finish}>
                Start piloting 🚀
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
