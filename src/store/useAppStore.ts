import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type { ContentPillar, CreatorProfile, Goal, ScheduledItem } from '../types'
import { colorForIndex, defaultPillarsFor, type PillarTemplate } from '../data/pillars'
import { seedDefaultGoals } from '../lib/goals'

export type Theme = 'light' | 'dark' | 'system'

interface AppState {
  profile: CreatorProfile | null
  pillars: ContentPillar[]
  items: ScheduledItem[]
  goals: Goal[]
  theme: Theme

  completeOnboarding: (profile: CreatorProfile, pillarOverrides?: PillarTemplate[]) => void
  updateProfile: (partial: Partial<CreatorProfile>) => void

  addPillar: (p: Omit<ContentPillar, 'id'>) => void
  updatePillar: (id: string, partial: Partial<ContentPillar>) => void
  removePillar: (id: string) => void

  addItem: (item: Omit<ScheduledItem, 'id' | 'createdAt'>) => string
  updateItem: (id: string, partial: Partial<ScheduledItem>) => void
  removeItem: (id: string) => void

  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
  updateGoal: (id: string, partial: Partial<Goal>) => void
  removeGoal: (id: string) => void

  setTheme: (t: Theme) => void
  resetAll: () => void
  loadSnapshot: (snapshot: Pick<AppState, 'profile' | 'pillars' | 'items' | 'goals' | 'theme'>) => void
}

function pillarsFromTemplates(templates: PillarTemplate[]): ContentPillar[] {
  return templates.map((t, i) => ({
    id: uuid(),
    name: t.name,
    description: t.description,
    weight: t.weight,
    color: colorForIndex(i),
  }))
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      pillars: [],
      items: [],
      goals: [],
      theme: 'system',

      completeOnboarding: (profile, pillarOverrides) => {
        const now = new Date()
        const templates = pillarOverrides ?? defaultPillarsFor(profile.niche)
        set({
          profile,
          pillars: pillarsFromTemplates(templates),
          goals: seedDefaultGoals(profile, now),
        })
      },

      updateProfile: (partial) => {
        const current = get().profile
        if (!current) return
        set({ profile: { ...current, ...partial } })
      },

      addPillar: (p) => set({ pillars: [...get().pillars, { ...p, id: uuid() }] }),
      updatePillar: (id, partial) =>
        set({ pillars: get().pillars.map((p) => (p.id === id ? { ...p, ...partial } : p)) }),
      removePillar: (id) => set({ pillars: get().pillars.filter((p) => p.id !== id) }),

      addItem: (item) => {
        const id = uuid()
        set({ items: [...get().items, { ...item, id, createdAt: new Date().toISOString() }] })
        return id
      },
      updateItem: (id, partial) =>
        set({ items: get().items.map((i) => (i.id === id ? { ...i, ...partial } : i)) }),
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      addGoal: (goal) => set({ goals: [...get().goals, { ...goal, id: uuid(), createdAt: new Date().toISOString() }] }),
      updateGoal: (id, partial) =>
        set({ goals: get().goals.map((g) => (g.id === id ? { ...g, ...partial } : g)) }),
      removeGoal: (id) => set({ goals: get().goals.filter((g) => g.id !== id) }),

      setTheme: (theme) => set({ theme }),
      resetAll: () => set({ profile: null, pillars: [], items: [], goals: [], theme: 'system' }),
      loadSnapshot: (snapshot) => set({ ...snapshot }),
    }),
    { name: 'contentpilot-store' },
  ),
)
