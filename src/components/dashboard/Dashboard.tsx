import { useState } from 'react'
import { format } from 'date-fns'
import { Topbar } from '../layout/Topbar'
import { NextUpCard } from './NextUpCard'
import { StreakCard } from './StreakCard'
import { BestTimesWidget } from './BestTimesWidget'
import { GoalsSummaryCard } from './GoalsSummaryCard'
import { ActivityChart } from './ActivityChart'
import { UpcomingScheduleList } from './UpcomingScheduleList'
import { ScheduleItemModal } from '../calendar/ScheduleItemModal'
import { useAppStore } from '../../store/useAppStore'
import type { ScheduledItem } from '../../types'

export function Dashboard() {
  const profile = useAppStore((s) => s.profile)
  const [modalState, setModalState] = useState<
    | { mode: 'closed' }
    | { mode: 'create'; date: string; time: string; pillarId: string | null; title: string }
    | { mode: 'edit'; item: ScheduledItem }
  >({ mode: 'closed' })

  return (
    <div>
      <Topbar
        title={`Welcome back${profile ? `, ${profile.displayName.split(' ')[0]}` : ''}`}
        subtitle={format(new Date(), 'EEEE, MMMM d, yyyy')}
      />

      <div className="grid grid-cols-1 gap-5 p-5 md:p-8 lg:grid-cols-3">
        <NextUpCard
          onSchedule={(args) => setModalState({ mode: 'create', ...args })}
        />
        <StreakCard />

        <BestTimesWidget />
        <GoalsSummaryCard />
        <ActivityChart />
        <UpcomingScheduleList onEdit={(item) => setModalState({ mode: 'edit', item })} />
        <div className="hidden lg:block" />
      </div>

      {modalState.mode === 'create' && (
        <ScheduleItemModal
          onClose={() => setModalState({ mode: 'closed' })}
          initialDate={modalState.date}
          initialTime={modalState.time}
          initialPillarId={modalState.pillarId}
          initialTitle={modalState.title}
        />
      )}
      {modalState.mode === 'edit' && (
        <ScheduleItemModal onClose={() => setModalState({ mode: 'closed' })} existing={modalState.item} />
      )}
    </div>
  )
}
