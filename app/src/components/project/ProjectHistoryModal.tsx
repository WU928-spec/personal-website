import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { getProjectStats, getRecentDaysBreakdown, formatDuration } from '@/utils/projectAggregation'
import { loadAllEntries } from '@/utils/calendarStorage'
import { useLiveTick } from '@/hooks/useLiveTick'
import ProjectBarChart from './ProjectBarChart'
import TaskItem from './TaskItem'

interface ProjectHistoryModalProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
}

export default function ProjectHistoryModal({ projectId, isOpen, onClose }: ProjectHistoryModalProps) {
  useLiveTick()
  const stats = getProjectStats(projectId, undefined, loadAllEntries())

  // 计算覆盖完整历史所需的天数
  const totalDayCount = (() => {
    if (!stats || stats.dailyBreakdown.length === 0) return 0
    const earliest = new Date(stats.dailyBreakdown[0].date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.floor((today.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)) + 1
  })()

  const allData = getRecentDaysBreakdown(projectId, totalDayCount, loadAllEntries())

  const totalSeconds = allData.reduce((s, d) => s + d.seconds, 0)
  const project = stats?.project

  if (!isOpen) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 dark:bg-black/50 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-3 top-[5vh] bottom-[5vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[640px] bg-Parchment dark:bg-Graphite border border-Sand dark:border-white/10 rounded-2xl z-50 shadow-deep flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-Sand dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            {project && (
              <>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                <h3 className="font-display text-[1.125rem] font-medium text-Ink dark:text-white">
                  {project.name}
                </h3>
                <span className="text-[0.625rem] text-Slate/50 dark:text-white/30">
                  全部历史 · 共 {formatDuration(totalSeconds)}
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-Sand dark:border-white/15 text-Ink dark:text-white hover:border-Amber hover:text-Amber transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Full bar chart */}
          <ProjectBarChart
            data={allData}
            color={project?.color || '#C9A84C'}
            totalSeconds={totalSeconds}
            variant="full"
          />

          {/* Full task list */}
          {stats && stats.dailyBreakdown.length > 0 && (
            <div className="space-y-2">
              {[...stats.dailyBreakdown]
                .reverse()
                .map((day) => (
                  <div key={day.date} className="border-b border-Sand/30 dark:border-white/5 pb-2 last:border-0">
                    <p className="text-[0.6875rem] font-medium text-Slate/60 dark:text-white/40 mb-1.5">
                      {day.date} · {formatDuration(day.seconds)}
                    </p>
                    <div className="space-y-1">
                      {day.todos.map((todo) => (
                        <TaskItem key={todo.id} todo={todo} />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
