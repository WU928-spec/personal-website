import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Clock,
  Target,
  ListChecks,
  Plus,
} from 'lucide-react'
import type { Project } from '@/types/calendar'
import { formatDuration } from '@/utils/projectAggregation'
import ProjectStatBadge from './ProjectStatBadge'
import ProjectDetail from './ProjectDetail'
import SubProjectCard from './SubProjectCard'

interface ProjectCardProps {
  project: Project
  stats: { totalSeconds: number; totalTodos: number; doneTodos: number }
  subProjects: Project[]
  isExpanded: boolean
  index: number
  isLoggedIn?: boolean
  onToggle: () => void
  onOpenHistory: () => void
  onEdit: () => void
  onDelete: () => void
  onComplete: () => void
  onReactivate: () => void
  onAddSubProject: () => void
}

export default function ProjectCard({
  project,
  stats,
  subProjects,
  isExpanded,
  index,
  isLoggedIn = false,
  onToggle,
  onOpenHistory,
  onEdit,
  onDelete,
  onComplete,
  onReactivate,
  onAddSubProject,
}: ProjectCardProps) {
  const { totalSeconds, totalTodos, doneTodos } = stats
  const progress = project.targetHours > 0
    ? Math.min(totalSeconds / 3600 / project.targetHours, 1)
    : 0
  const isCompleted = project.status === 'completed'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-xl border transition-all duration-300 ${
        isCompleted
          ? 'bg-white/40 dark:bg-white/[0.03] border-Sand/50 dark:border-white/5'
          : 'bg-white/70 dark:bg-white/5 border-Sand dark:border-white/10'
      }`}
    >
      {/* Card header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
      >
        {/* Color indicator */}
        <div
          className={`w-3 h-3 rounded-full shrink-0 ${isCompleted ? 'opacity-40' : ''}`}
          style={{ backgroundColor: project.color }}
        />

        {/* Info */}
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

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-4 shrink-0">
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

        {/* Expand icon */}
        <div className="shrink-0 text-Slate/40 dark:text-white/30">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-Sand/50 dark:border-white/5">
              {/* Mobile stats */}
              <div className="sm:hidden flex items-center gap-4 mb-4 mt-3">
                <ProjectStatBadge icon={<Clock size={12} />} label="已投入" value={formatDuration(totalSeconds)} />
                <ProjectStatBadge icon={<ListChecks size={12} />} label="任务" value={`${doneTodos}/${totalTodos}`} />
                {project.targetHours > 0 && (
                  <ProjectStatBadge icon={<Target size={12} />} label="进度" value={`${Math.round(progress * 100)}%`} />
                )}
              </div>

              {/* Chart & timeline */}
              <ProjectDetail
                projectId={project.id}
                color={project.color}
                isCompleted={isCompleted}
                onOpenHistory={onOpenHistory}
              />

              {/* Sub-projects */}
              {subProjects.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[0.75rem] font-medium text-Slate/60 dark:text-white/40 mb-1.5">
                    子项目
                  </p>
                  {subProjects.map((sub) => (
                    <SubProjectCard
                      key={sub.id}
                      subProject={sub}
                      parentColor={project.color}
                    />
                  ))}
                </div>
              )}

              {isLoggedIn && !isCompleted && (
                <button
                  onClick={onAddSubProject}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-Sand dark:border-white/10 text-[0.8125rem] text-Slate/60 dark:text-white/40 hover:border-Amber hover:text-Amber transition-colors"
                >
                  <Plus size={14} />
                  添加子项目
                </button>
              )}

              {/* Actions */}
              {isLoggedIn && !isCompleted && (
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-Sand/50 dark:border-white/5">
                  <button
                    onClick={onEdit}
                    className="text-[0.75rem] text-Slate/60 dark:text-white/40 hover:text-Amber transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={onComplete}
                    className="flex items-center gap-1 text-[0.75rem] text-Sage hover:text-Sage/80 transition-colors"
                  >
                    <CheckCircle2 size={12} />
                    标记完成
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={onDelete}
                    className="flex items-center gap-1 text-[0.75rem] text-Slate/40 hover:text-Rose transition-colors"
                  >
                    <Trash2 size={12} />
                    删除
                  </button>
                </div>
              )}
              {isLoggedIn && isCompleted && (
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-Sand/50 dark:border-white/5">
                  <button
                    onClick={onReactivate}
                    className="flex items-center gap-1 text-[0.75rem] text-Amber hover:text-Amber/80 transition-colors"
                  >
                    <RotateCcw size={12} />
                    重新激活
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={onDelete}
                    className="flex items-center gap-1 text-[0.75rem] text-Slate/40 hover:text-Rose transition-colors"
                  >
                    <Trash2 size={12} />
                    删除
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
