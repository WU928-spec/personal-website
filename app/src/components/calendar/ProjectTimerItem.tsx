import { Play, Square } from 'lucide-react'
import type { Project } from '@/types/calendar'
import { formatDurationShort } from '@/utils/projectAggregation'

interface ProjectTimerItemProps {
  project: Project
  isTracking: boolean
  isLoggedIn: boolean
  displayTime: number
  onToggleTimer: () => void
}

export default function ProjectTimerItem({
  project,
  isTracking,
  isLoggedIn,
  displayTime,
  onToggleTimer,
}: ProjectTimerItemProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all ${
        isTracking
          ? 'bg-Amber/5 border border-Amber/20'
          : 'border border-transparent'
      }`}
    >
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: project.color }}
      />
      <span className="flex-1 text-[0.8125rem] truncate text-Ink dark:text-white/80">
        {project.name}
      </span>
      <span className="text-[0.625rem] font-mono text-Slate/60 dark:text-white/40 shrink-0">
        {formatDurationShort(displayTime)}
      </span>
      <button
        onClick={onToggleTimer}
        disabled={!isLoggedIn}
        className={`
          shrink-0 flex items-center justify-center w-6 h-6 rounded-md transition-all
          ${!isLoggedIn ? 'cursor-not-allowed opacity-40' : ''}
          ${isTracking
            ? 'bg-Amber text-white'
            : 'bg-Mist dark:bg-white/10 text-Slate dark:text-white/50 hover:text-Amber hover:bg-Amber/10'
          }
        `}
        title={isTracking ? '停止计时' : '开始计时'}
      >
        {isTracking ? <Square size={11} /> : <Play size={11} />}
      </button>
    </div>
  )
}
