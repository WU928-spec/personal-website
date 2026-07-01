import { Clock } from 'lucide-react'
import { getProjectStats, formatDuration } from '@/utils/projectAggregation'
import { formatDateStr, loadAllEntries } from '@/utils/calendarStorage'
import { useLiveTick } from '@/hooks/useLiveTick'
import TaskItem from './TaskItem'

interface ProjectDetailProps {
  projectId: string
  color: string
  isCompleted: boolean
  onOpenHistory: () => void
  showAllHistory?: boolean
}

export default function ProjectDetail({
  projectId,
  onOpenHistory,
  showAllHistory = false,
}: ProjectDetailProps) {
  useLiveTick()
  const stats = getProjectStats(projectId, undefined, loadAllEntries())

  let dayCount: number
  let headerLabel: string

  if (showAllHistory && stats && stats.dailyBreakdown.length > 0) {
    // 全部历史：从最早记录到今天
    const earliest = new Date(stats.dailyBreakdown[0].date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    dayCount = Math.floor((today.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)) + 1
    headerLabel = '全部历史'
  } else {
    // 智能最近天数：至少 7 天，且覆盖最近 5 条任务
    const MIN_DAYS = 7
    const MIN_TASKS = 5
    if (!stats || stats.dailyBreakdown.length === 0) {
      dayCount = MIN_DAYS
    } else {
      const totalTasks = stats.dailyBreakdown.reduce((s, d) => s + d.todos.length, 0)
      if (totalTasks < MIN_TASKS) {
        const earliest = new Date(stats.dailyBreakdown[0].date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        dayCount = Math.max(
          Math.floor((today.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)) + 1,
          MIN_DAYS
        )
      } else {
        let taskCount = 0
        let earliestDate: Date | null = null
        for (let i = stats.dailyBreakdown.length - 1; i >= 0; i--) {
          taskCount += stats.dailyBreakdown[i].todos.length
          earliestDate = new Date(stats.dailyBreakdown[i].date)
          if (taskCount >= MIN_TASKS) break
        }
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        dayCount = earliestDate
          ? Math.max(
              Math.floor((today.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
              MIN_DAYS
            )
          : MIN_DAYS
      }
    }
    headerLabel = `最近 ${dayCount} 天`
  }

  const totalSeconds = stats ? stats.totalSeconds : 0

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - dayCount + 1)
  const cutoffDateStr = formatDateStr(cutoffDate)

  const hasHistory = stats && stats.dailyBreakdown.length > 0

  return (
    <div className="space-y-4 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-Slate/50 dark:text-white/30" />
          <span className="text-label text-Slate dark:text-white/50">
            {headerLabel}
          </span>
          <span className="text-label text-Slate/40 dark:text-white/30">
            共 {formatDuration(totalSeconds)}
          </span>
        </div>
        {!showAllHistory && hasHistory && (
          <button
            onClick={onOpenHistory}
            className="text-label text-Amber hover:text-Amber/80 transition-colors"
          >
            查看全部历史 →
          </button>
        )}
      </div>

      {/* Task list */}
      {hasHistory && (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {[...stats.dailyBreakdown]
            .reverse()
            .filter((day) => showAllHistory || day.date >= cutoffDateStr)
            .map((day) => (
              <div key={day.date}>
                <p className="text-label text-Slate/40 dark:text-white/25 mb-2 sticky top-0 bg-Parchment dark:bg-Graphite py-1">
                  {day.date}
                </p>
                <div className="space-y-2 pl-2">
                  {day.todos.filter((t) => !!t.text && t.projectId === projectId).map((todo) => (
                    <TaskItem key={todo.id} todo={todo} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
