import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Target, ListChecks } from 'lucide-react'
import type { Project } from '@/types/calendar'
import { formatDuration } from '@/utils/projectAggregation'
import ProjectStatBadge from './ProjectStatBadge'
import ProjectDetail from './ProjectDetail'
import SubProjectCard from './SubProjectCard'
import ProjectCardHeader from './card-parts/ProjectCardHeader'
import SummarySection from './card-parts/SummarySection'
import ProjectActions from './card-parts/ProjectActions'

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
  onAddSummary: (projectId: string, title: string, content: string) => void
  onDeleteSummary: (projectId: string, summaryId: string) => void
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
  onAddSummary,
  onDeleteSummary,
}: ProjectCardProps) {
  const [showSummaryForm, setShowSummaryForm] = useState(false)
  const [summaryTitle, setSummaryTitle] = useState('')
  const [summaryContent, setSummaryContent] = useState('')
  const summaries = project.summaries || []
  const { totalSeconds, totalTodos, doneTodos } = stats
  const progress = project.targetHours > 0
    ? Math.min(totalSeconds / 3600 / project.targetHours, 1)
    : 0
  const isCompleted = project.status === 'completed'

  const handleAddSummaryClick = () => {
    setShowSummaryForm(true)
  }

  const handleSaveSummary = () => {
    if (summaryTitle.trim() && summaryContent.trim()) {
      onAddSummary(project.id, summaryTitle.trim(), summaryContent.trim())
      setShowSummaryForm(false)
      setSummaryTitle('')
      setSummaryContent('')
    }
  }

  const handleCancelSummary = () => {
    setShowSummaryForm(false)
    setSummaryTitle('')
    setSummaryContent('')
  }

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
      <ProjectCardHeader
        project={project}
        totalSeconds={totalSeconds}
        progress={progress}
        isExpanded={isExpanded}
        isLoggedIn={isLoggedIn}
        isCompleted={isCompleted}
        onToggle={onToggle}
        onAddSubProject={onAddSubProject}
        onAddSummary={() => {
          if (!isExpanded) onToggle()
          handleAddSummaryClick()
        }}
      />

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
              <div className="sm:hidden flex items-center gap-4 mb-4 mt-3">
                <ProjectStatBadge icon={<Clock size={12} />} label="已投入" value={formatDuration(totalSeconds)} />
                <ProjectStatBadge icon={<ListChecks size={12} />} label="任务" value={`${doneTodos}/${totalTodos}`} />
                {project.targetHours > 0 && (
                  <ProjectStatBadge icon={<Target size={12} />} label="进度" value={`${Math.round(progress * 100)}%`} />
                )}
              </div>

              <ProjectDetail
                projectId={project.id}
                color={project.color}
                isCompleted={isCompleted}
                onOpenHistory={onOpenHistory}
              />

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

              <SummarySection
                summaries={summaries}
                showForm={showSummaryForm}
                formTitle={summaryTitle}
                formContent={summaryContent}
                onTitleChange={setSummaryTitle}
                onContentChange={setSummaryContent}
                onSave={handleSaveSummary}
                onCancel={handleCancelSummary}
                onDelete={(id) => onDeleteSummary(project.id, id)}
                isLoggedIn={isLoggedIn}
                isCompleted={isCompleted}
              />

              <ProjectActions
                isCompleted={isCompleted}
                isLoggedIn={isLoggedIn}
                onEdit={onEdit}
                onComplete={onComplete}
                onReactivate={onReactivate}
                onDelete={onDelete}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
