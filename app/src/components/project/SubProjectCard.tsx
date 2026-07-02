import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Project } from '@/types/calendar'
import { formatDuration } from '@/utils/projectAggregation'
import { useProjectStats } from '@/hooks/useProjectStats'
import ProjectDetail from './ProjectDetail'

interface SubProjectCardProps {
  subProject: Project
  parentColor: string
}

export default function SubProjectCard({ subProject, parentColor }: SubProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const stats = useProjectStats(subProject.id)
  const progress = subProject.targetHours > 0
    ? Math.min((stats?.totalSeconds || 0) / 3600 / subProject.targetHours, 1)
    : 0

  const color = subProject.color || parentColor

  return (
    <div className="rounded-lg border border-Sand/50 dark:border-white/5 bg-white/40 dark:bg-white/[0.03] overflow-hidden">
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2 text-left"
      >
        <div
          className="w-2 h-2 rounded shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="flex-1 text-caption text-Ink dark:text-white truncate">
          {subProject.name}
        </span>
        {subProject.targetHours > 0 && (
          <div className="hidden sm:flex items-center gap-2 w-20">
            <div className="flex-1 h-1 bg-Mist/50 dark:bg-white/5 rounded overflow-hidden">
              <div
                className="h-full rounded transition-all duration-500"
                style={{ width: `${progress * 100}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-label text-Slate/50 dark:text-white/30">
              {Math.round(progress * 100)}%
            </span>
          </div>
        )}
        <span className="text-label font-mono text-Slate/50 dark:text-white/30 shrink-0">
          {formatDuration(stats?.totalSeconds || 0)}
        </span>
        {isExpanded ? (
          <ChevronUp size={14} className="text-Slate/40" />
        ) : (
          <ChevronDown size={14} className="text-Slate/40" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && stats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <ProjectDetail
                projectId={subProject.id}
                color={color}
                isCompleted={subProject.status === 'completed'}
                onOpenHistory={() => {}}
                showAllHistory
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
