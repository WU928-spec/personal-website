import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, FolderOpen } from 'lucide-react'
import type { Project } from '@/types/calendar'
import {
  loadProjects,
  addProject,
  updateProject,
  deleteProject,
  completeProject,
  activateProject,
  getSubProjects,
  generateId,
  syncProjects,
  addProjectSummary,
  deleteProjectSummary,
} from '@/utils/projectStorage'
import { getProjectStats } from '@/utils/projectAggregation'
import { loadAllEntries } from '@/utils/calendarStorage'
import { useLiveTick } from '@/hooks/useLiveTick'
import { useAuth } from '@/contexts/AuthContext'
import PageSEO from '@/components/PageSEO'
import ProjectCard from '@/components/project/ProjectCard'
import ProjectHistoryModal from '@/components/project/ProjectHistoryModal'
import ProjectFormModal from '@/components/project/ProjectFormModal'

interface ProjectStats {
  totalSeconds: number
  totalTodos: number
  doneTodos: number
}

export default function Projects() {
  const { isLoggedIn } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [historyProjectId, setHistoryProjectId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formParentId, setFormParentId] = useState<string>('')
  useLiveTick()

  /* Load projects */
  const refresh = useCallback(() => {
    setProjects(loadProjects())
  }, [])

  useEffect(() => {
    refresh()
    /* Background sync with Supabase */
    syncProjects().then(() => refresh())
    const handleSaved = () => refresh()
    window.addEventListener('calendar-entry-saved', handleSaved)
    window.addEventListener('focus', () => {
      refresh()
      syncProjects().then(() => refresh())
    })
    return () => {
      window.removeEventListener('calendar-entry-saved', handleSaved)
    }
  }, [refresh])

  /* Stats map — pre-load data once to avoid repeated localStorage reads */
  const allProjects = loadProjects()
  const allEntries = loadAllEntries()
  const statsMap = new Map<string, ProjectStats>()
  for (const p of projects) {
    const s = getProjectStats(p.id, allProjects, allEntries)
    if (s) {
      statsMap.set(p.id, {
        totalSeconds: s.totalSeconds,
        totalTodos: s.totalTodos,
        doneTodos: s.doneTodos,
      })
    }
  }

  const getStats = (id: string): ProjectStats =>
    statsMap.get(id) || { totalSeconds: 0, totalTodos: 0, doneTodos: 0 }

  /* Handlers */
  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const openForm = (project?: Project, parentId?: string) => {
    if (project) {
      setEditingProject(project)
      setFormParentId('')
    } else {
      setEditingProject(null)
      setFormParentId(parentId || '')
    }
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingProject(null)
    setFormParentId('')
  }

  const handleFormSubmit = (data: {
    name: string
    description?: string
    color: string
    targetHours: number
    parentId?: string
  }) => {
    if (editingProject) {
      updateProject({
        ...editingProject,
        name: data.name,
        description: data.description,
        color: data.color,
        targetHours: data.targetHours,
      })
    } else {
      addProject({
        id: generateId(),
        name: data.name,
        description: data.description,
        color: data.color,
        targetHours: data.targetHours,
        status: 'active',
        createdAt: new Date().toISOString(),
        parentId: data.parentId,
      })
    }
    closeForm()
    refresh()
  }

  const withAuth = (fn: () => void) => {
    if (!isLoggedIn) return
    fn()
    refresh()
  }

  const handleDelete = (id: string) => withAuth(() => {
    if (confirm('确定删除此项目？关联的日历任务将保留但不再显示项目标签。')) {
      deleteProject(id)
      if (expandedId === id) setExpandedId(null)
    }
  })

  const handleComplete = (id: string) => withAuth(() => completeProject(id))
  const handleReactivate = (id: string) => withAuth(() => activateProject(id))
  const handleAddSummary = (projectId: string, title: string, content: string) =>
    withAuth(() => addProjectSummary(projectId, title, content))
  const handleDeleteSummary = (projectId: string, summaryId: string) =>
    withAuth(() => deleteProjectSummary(projectId, summaryId))

  /* Active first, then completed; only parent projects */
  const sortedProjects = [...projects]
    .filter((p) => !p.parentId)
    .sort((a, b) => {
      if (a.status === b.status) return a.name.localeCompare(b.name)
      return a.status === 'active' ? -1 : 1
    })

  return (
    <div className="bg-Parchment min-h-screen">
      <PageSEO
        title="Projects"
        description="Track long-term projects and see progress from calendar data."
        path="/projects"
      />

      {/* ── Hero ── */}
      <section className="relative pt-16 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-display text-display font-medium text-Ink dark:text-white">
              项目追踪
            </h1>
            <p className="mt-2 text-body text-Ink/60 dark:text-white/50 max-w-lg">
              管理中长期目标，实时追踪来自日历的投入时间与进度。
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Add button */}
          {isLoggedIn && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => openForm()}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-lg border-2 border-dashed border-Sand dark:border-white/15 text-Slate dark:text-white/50 hover:border-Amber hover:text-Amber transition-all duration-200"
            >
              <Plus size={18} />
              <span className="text-body font-medium">新建项目</span>
            </motion.button>
          )}

          {/* Project list */}
          {sortedProjects.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen size={40} className="mx-auto text-Slate/30 dark:text-white/10 mb-4" />
              <p className="text-Slate/50 dark:text-white/30 text-caption">
                还没有项目，点击上方创建第一个项目
              </p>
            </div>
          ) : (
            sortedProjects.map((project, idx) => (
              <ProjectCard
                key={project.id}
                project={project}
                stats={getStats(project.id)}
                subProjects={getSubProjects(project.id)}
                isExpanded={expandedId === project.id}
                index={idx}
                isLoggedIn={isLoggedIn}
                onToggle={() => toggleExpand(project.id)}
                onOpenHistory={() => setHistoryProjectId(project.id)}
                onEdit={() => openForm(project)}
                onDelete={() => handleDelete(project.id)}
                onComplete={() => handleComplete(project.id)}
                onReactivate={() => handleReactivate(project.id)}
                onAddSubProject={() => openForm(undefined, project.id)}
                onAddSummary={handleAddSummary}
                onDeleteSummary={handleDeleteSummary}
              />
            ))
          )}
        </div>
      </section>

      {/* ── History Modal ── */}
      {historyProjectId && (
        <ProjectHistoryModal
          projectId={historyProjectId}
          isOpen={!!historyProjectId}
          onClose={() => setHistoryProjectId(null)}
        />
      )}

      {/* ── Form Modal ── */}
      <ProjectFormModal
        isOpen={showForm}
        editingProject={editingProject}
        projects={projects}
        initialParentId={formParentId}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
