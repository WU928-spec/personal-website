import { ChevronDown, ChevronUp, FolderPlus, FileText } from 'lucide-react'
import type { Project } from '@/types/calendar'
import { formatDuration } from '@/utils/projectAggregation'

interface Props {
  project: Project
  totalSeconds: number
  progress: number
  isExpanded: boolean
  isLoggedIn: boolean
  isCompleted: boolean
  onToggle: () => void
  onAddSubProject: () => void
  onAddSummary: () => void
}

export default function ProjectCardHeader({
  project,
  totalSeconds,
  progress,
  isExpanded,
  isLoggedIn,
  isCompleted,
  onToggle,
  onAddSubProject,
  onAddSummary,
}: Props) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-5 py-4 text-left"
    >
      <div
        className={`w-3 h-3 rounded-full shrink-0 ${isCompleted ? 'opacity-40' : ''}`}
        style={{ backgroundColor: project.color }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className={`text-[1rem] font-medium truncate ${
              isCompleted
                ? 'text-Slate/50 dark:text-white/30 line-through'
                : 'text-Ink dark:text-white'
            }`}
          >
            {project.name}
          </h3>
          {isCompleted && (
            <span className="shrink-0 text-[0.625rem] px-1.5 py-0.5 rounded bg-Sage/10 text-Sage font-medium">
              已完成
            </span>
          )}
        </div>
        {project.description && (
          <p className="text-[0.75rem] text-Slate/60 dark:text-white/30 truncate mt-0.5">
            {project.description}
          </p>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-4 shrink-0">
        {isLoggedIn && !isCompleted && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAddSubProject()
              }}
              className="p-1 rounded text-Slate/40 dark:text-white/30 hover:text-Amber hover:bg-Amber/10 transition-colors"
              title="添加子项目"
            >
              <FolderPlus size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAddSummary()
              }}
              className="p-1 rounded text-Slate/40 dark:text-white/30 hover:text-Amber hover:bg-Amber/10 transition-colors"
              title="添加阶段总结"
            >
              <FileText size={14} />
            </button>
          </div>
        )}
        <div className="text-right">
          <p className="text-[0.6875rem] text-Slate/50 dark:text-white/30">已投入</p>
          <p className="text-[0.8125rem] font-medium text-Ink dark:text-white/80">
            {formatDuration(totalSeconds)}
          </p>
        </div>
        {project.targetHours > 0 && (
          <div className="w-24">
            <div className="flex justify-between text-[0.625rem] text-Slate/50 dark:text-white/30 mb-1">
              <span>进度</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1.5 bg-Mist/50 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progress * 100}%`,
                  backgroundColor: isCompleted ? '#6B8E6B' : project.color,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 text-Slate/40 dark:text-white/30">
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
    </button>
  )
}
