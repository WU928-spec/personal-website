import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { Project } from '@/types/calendar'
import { PROJECT_COLORS } from '@/types/calendar'

interface ProjectFormModalProps {
  isOpen: boolean
  editingProject: Project | null
  projects: Project[] // for parent project dropdown
  initialParentId?: string
  onClose: () => void
  onSubmit: (data: {
    name: string
    description?: string
    color: string
    targetHours: number
    parentId?: string
  }) => void
}

export default function ProjectFormModal({
  isOpen,
  editingProject,
  projects,
  initialParentId,
  onClose,
  onSubmit,
}: ProjectFormModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState<string>(PROJECT_COLORS[0].value)
  const [target, setTarget] = useState('')
  const [parentId, setParentId] = useState('')

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name)
      setDescription(editingProject.description || '')
      setColor(editingProject.color)
      setTarget(String(editingProject.targetHours))
      setParentId(editingProject.parentId || '')
    } else {
      setName('')
      setDescription('')
      setColor(PROJECT_COLORS[0].value)
      setTarget('')
      setParentId(initialParentId || '')
    }
  }, [editingProject, initialParentId, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const targetHours = parseFloat(target) || 0
    if (!trimmedName) return

    onSubmit({
      name: trimmedName,
      description: description.trim() || undefined,
      color,
      targetHours,
      parentId: parentId || undefined,
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 dark:bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-[10vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[480px] max-h-[80vh] overflow-y-auto bg-Parchment dark:bg-Graphite border border-Sand dark:border-white/15 rounded-2xl z-50 shadow-deep p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-[1.25rem] font-medium text-Ink dark:text-white">
                {editingProject ? '编辑项目' : '新建项目'}
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-Sand dark:border-white/15 text-Ink dark:text-white hover:border-Amber hover:text-Amber transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[0.8125rem] font-medium text-Slate dark:text-white/50 mb-1">
                  项目名称 *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：学习 TypeScript"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-Sand dark:border-white/15 bg-white dark:bg-white/5 text-Ink dark:text-white text-[0.9375rem] placeholder:text-Slate/40 focus:outline-none focus:border-Amber/50 focus:ring-1 focus:ring-Amber/20"
                />
              </div>

              <div>
                <label className="block text-[0.8125rem] font-medium text-Slate dark:text-white/50 mb-1">
                  项目描述
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="简单描述这个项目的目标..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-Sand dark:border-white/15 bg-white dark:bg-white/5 text-Ink dark:text-white text-[0.9375rem] placeholder:text-Slate/40 focus:outline-none focus:border-Amber/50 focus:ring-1 focus:ring-Amber/20 resize-none"
                />
              </div>

              {!editingProject && (
                <div>
                  <label className="block text-[0.8125rem] font-medium text-Slate dark:text-white/50 mb-1">
                    所属项目（可选）
                  </label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-Sand dark:border-white/15 bg-white dark:bg-white/5 text-Ink dark:text-white text-[0.9375rem] focus:outline-none focus:border-Amber/50 focus:ring-1 focus:ring-Amber/20"
                  >
                    <option value="">顶级项目（无父项目）</option>
                    {projects
                      .filter((p) => !p.parentId && p.status === 'active')
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[0.8125rem] font-medium text-Slate dark:text-white/50 mb-1">
                  预计投入时间（小时）
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="例如：50"
                  className="w-full px-3 py-2 rounded-lg border border-Sand dark:border-white/15 bg-white dark:bg-white/5 text-Ink dark:text-white text-[0.9375rem] placeholder:text-Slate/40 focus:outline-none focus:border-Amber/50 focus:ring-1 focus:ring-Amber/20"
                />
              </div>

              <div>
                <label className="block text-[0.8125rem] font-medium text-Slate dark:text-white/50 mb-2">
                  标签颜色
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-8 h-8 rounded-full transition-all duration-200 ${
                        color === c.value
                          ? 'ring-2 ring-offset-2 ring-Amber scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-Sand dark:border-white/15 text-Slate dark:text-white/70 text-[0.875rem] font-medium hover:bg-Mist/50 dark:hover:bg-white/5 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-Amber text-white text-[0.875rem] font-semibold hover:bg-[#B06A2F] transition-colors"
                >
                  {editingProject ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
