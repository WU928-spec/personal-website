import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, BookOpen, CalendarCheck, CheckCircle2, Circle, Tag } from 'lucide-react'
import { getLunarDate, getDayDetail, getSolarTerms } from 'chinese-days'
import type { TodoItem, Project } from '@/types/calendar'
import { loadProjects } from '@/utils/projectStorage'
import { loadEntry, saveEntry, formatDateStr } from '@/utils/calendarStorage'
import { useAuth } from '@/contexts/AuthContext'

/* ─── Component ─── */
interface DayDetailPanelProps {
  date: Date | null
  isOpen: boolean
  onClose: () => void
  onEntryChange?: () => void
}

export default function DayDetailPanel({
  date,
  isOpen,
  onClose,
  onEntryChange,
}: DayDetailPanelProps) {
  const { isLoggedIn } = useAuth()
  if (!date) return null

  const dateStr = formatDateStr(date)
  const todayStr = formatDateStr(new Date())
  const isToday = dateStr === todayStr
  const isPast = dateStr < todayStr

  /* ── Derived date info ── */
  const lunar = getLunarDate(dateStr)
  const dayDetail = getDayDetail(dateStr)
  const solarTerms = getSolarTerms(dateStr)
  const holidayCnName = dayDetail?.name?.split(',')[1]
  const term = solarTerms?.[0]
  const dateTitle = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  const lunarText = holidayCnName || term?.name || `${lunar.lunarMonCN}${lunar.lunarDayCN}`
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]

  /* ── State ── */
  const [activeTab, setActiveTab] = useState<'plan' | 'diary'>(isPast ? 'diary' : 'plan')
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [diary, setDiary] = useState('')
  const [newTodo, setNewTodo] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [saved, setSaved] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInitialLoad = useRef(true)

  /* ── Load data when panel opens ── */
  useEffect(() => {
    if (!isOpen || !date) return
    const entry = loadEntry(dateStr)
    if (entry) {
      const normalized = (entry.todos || []).map((t) => ({
        ...t,
        timeRecords: t.timeRecords || [],
      }))
      setTodos(normalized)
      setDiary(entry.diary || '')
    } else {
      setTodos([])
      setDiary('')
    }
    const all = loadProjects()
    setProjects(all.filter((p) => p.status === 'active'))
    setSelectedProjectId('')
    // Default tab: future/today → plan, past → diary
    setActiveTab(isPast ? 'diary' : 'plan')
    setSaved(false)
  }, [isOpen, date, dateStr, isPast])

  /* ── Save handler ── */
  const autoSave = useCallback(() => {
    saveEntry({
      date: dateStr,
      todos: todos.filter((t) => t.text.trim()),
      diary: diary.trim(),
    })
    setSaved(true)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => setSaved(false), 1500)
    onEntryChange?.()
    window.dispatchEvent(new CustomEvent('calendar-entry-saved', { detail: { date: dateStr } }))
  }, [dateStr, todos, diary, onEntryChange])

  // Auto-save when todos or diary change (skip initial load)
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }
    const timer = setTimeout(() => autoSave(), 500)
    return () => clearTimeout(timer)
  }, [todos, diary, autoSave])

  /* ── Todo handlers ── */
  const addTodo = useCallback(() => {
    const text = newTodo.trim()
    if (!text) return
    const todo: TodoItem = {
      id: generateId(),
      text,
      done: false,
      timeRecords: [],
    }
    if (selectedProjectId) {
      todo.projectId = selectedProjectId
    }
    setTodos((prev) => [...prev, todo])
    setNewTodo('')
    setSelectedProjectId('')
  }, [newTodo, selectedProjectId])

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              done: !t.done,
              doneAt: !t.done ? new Date().toISOString() : undefined,
            }
          : t
      )
    )
  }, [])

  const removeTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTodo()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[520px] bg-Parchment dark:bg-Graphite border-l border-Sand dark:border-white/10 z-50 flex flex-col shadow-deep"
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-3 border-b border-Sand dark:border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <h2 className="font-display text-[1.25rem] font-semibold text-Ink dark:text-white">
                      {dateTitle}
                    </h2>
                    <span className="text-[0.8125rem] text-Slate dark:text-white/50">
                      {weekday}
                    </span>
                  </div>
                  <p className="text-[0.75rem] text-Slate/70 dark:text-white/40 mt-0.5">
                    {lunarText}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-Sand dark:border-white/15 text-Ink dark:text-white hover:border-Amber hover:text-Amber transition-colors duration-200"
                  aria-label="关闭"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 mt-4 bg-Mist/50 dark:bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('plan')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[0.8125rem] font-medium transition-all duration-200 ${
                    activeTab === 'plan'
                      ? 'bg-white dark:bg-white/10 text-Amber shadow-sm'
                      : 'text-Slate dark:text-white/50 hover:text-Ink dark:hover:text-white'
                  }`}
                >
                  <CalendarCheck size={15} />
                  计划
                </button>
                <button
                  onClick={() => setActiveTab('diary')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[0.8125rem] font-medium transition-all duration-200 ${
                    activeTab === 'diary'
                      ? 'bg-white dark:bg-white/10 text-Amber shadow-sm'
                      : 'text-Slate dark:text-white/50 hover:text-Ink dark:hover:text-white'
                  }`}
                >
                  <BookOpen size={15} />
                  记录
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <AnimatePresence mode="wait">
                {activeTab === 'plan' && (
                  <motion.div
                    key="plan"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Todo list */}
                    <div className="space-y-2">
                      {todos.map((todo) => (
                        <div
                          key={todo.id}
                          className="flex items-center gap-2 bg-white dark:bg-white/5 border border-Sand dark:border-white/10 rounded-lg px-3 py-2.5 group"
                        >
                          <button
                            onClick={() => isLoggedIn && toggleTodo(todo.id)}
                            className={`shrink-0 transition-colors ${
                              !isLoggedIn ? 'cursor-not-allowed opacity-40' : ''
                            } ${
                              todo.done
                                ? 'text-Sage'
                                : 'text-Slate/40 dark:text-white/30 hover:text-Amber'
                            }`}
                          >
                            {todo.done ? (
                              <CheckCircle2 size={18} />
                            ) : (
                              <Circle size={18} />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-[0.9375rem] ${
                                todo.done
                                  ? 'line-through text-Slate/40 dark:text-white/30'
                                  : 'text-Ink dark:text-white'
                              }`}
                            >
                              {todo.text}
                            </span>
                            {todo.projectId && (
                              <ProjectTag
                                projectId={todo.projectId}
                                projects={projects}
                              />
                            )}
                          </div>
                          {isLoggedIn && (
                            <button
                              onClick={() => removeTodo(todo.id)}
                              className="opacity-0 group-hover:opacity-100 text-Slate/40 hover:text-Rose transition-all duration-200 shrink-0"
                              aria-label="删除"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {todos.length === 0 && (
                      <p className="text-center text-[0.8125rem] text-Slate/40 dark:text-white/20 py-8">
                        {isPast ? '当天没有计划' : '添加今天的计划...'}
                      </p>
                    )}

                    {/* Add todo — only for today & future & logged-in */}
                    {isLoggedIn && !isPast && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="添加待办..."
                            className="flex-1 px-3 py-2 rounded-lg border border-Sand dark:border-white/15 bg-white dark:bg-white/5 text-Ink dark:text-white text-[0.9375rem] placeholder:text-Slate/40 focus:outline-none focus:border-Amber/50 focus:ring-1 focus:ring-Amber/20"
                          />
                          <button
                            onClick={addTodo}
                            disabled={!newTodo.trim()}
                            className="flex items-center justify-center w-10 h-10 rounded-lg bg-Amber text-white hover:bg-[#B06A2F] disabled:opacity-30 disabled:hover:bg-Amber transition-colors duration-200 shrink-0"
                            aria-label="添加"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                        {projects.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Tag size={14} className="text-Slate/50 dark:text-white/30 shrink-0" />
                            <select
                              value={selectedProjectId}
                              onChange={(e) => setSelectedProjectId(e.target.value)}
                              className="flex-1 text-[0.8125rem] px-2 py-1.5 rounded-md border border-Sand dark:border-white/15 bg-white dark:bg-white/5 text-Ink dark:text-white focus:outline-none focus:border-Amber/50"
                            >
                              <option value="">无项目标签</option>
                              {projects
                                .filter((p) => !p.parentId)
                                .map((parent) => (
                                  <optgroup key={parent.id} label={parent.name}>
                                    <option value={parent.id}>直接归属「{parent.name}」</option>
                                    {projects
                                      .filter((p) => p.parentId === parent.id)
                                      .map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                          └ {sub.name}
                                        </option>
                                      ))}
                                  </optgroup>
                                ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'diary' && (
                  <motion.div
                    key="diary"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* All todos review */}
                    {todos.length > 0 && (
                      <div className="bg-white dark:bg-white/5 border border-Sand dark:border-white/10 rounded-lg px-4 py-3">
                        <p className="text-[0.75rem] font-medium text-Slate dark:text-white/50 mb-2">
                          当日任务回顾
                        </p>
                        <div className="space-y-1.5">
                          {todos.map((t) => (
                            <p
                              key={t.id}
                              className={`text-[0.875rem] ${
                                t.done
                                  ? 'text-Ink/50 dark:text-white/40 line-through'
                                  : 'text-Ink dark:text-white/80'
                              }`}
                            >
                              {t.done ? '✅' : '○'} {t.text}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Manual diary */}
                    <div>
                      <label className="block text-[0.8125rem] font-medium text-Slate dark:text-white/50 mb-1.5">
                        {isToday
                          ? '今天还有什么想记录的？'
                          : isPast
                            ? '回忆这一天...'
                            : '提前写点什么...'}
                      </label>
                      {isLoggedIn ? (
                        <textarea
                          value={diary}
                          onChange={(e) => setDiary(e.target.value)}
                          placeholder={
                            isToday
                              ? '记录下今天的点点滴滴...'
                              : isPast
                                ? '写下那天发生的事...'
                                : '对这一天有什么期待...'
                          }
                          rows={10}
                          className="w-full px-3 py-2.5 rounded-lg border border-Sand dark:border-white/15 bg-white dark:bg-white/5 text-Ink dark:text-white text-[0.9375rem] placeholder:text-Slate/40 focus:outline-none focus:border-Amber/50 focus:ring-1 focus:ring-Amber/20 resize-none leading-relaxed"
                        />
                      ) : (
                        <div className="w-full px-3 py-2.5 rounded-lg border border-Sand dark:border-white/15 bg-white dark:bg-white/5 text-Ink dark:text-white text-[0.9375rem] min-h-[120px]">
                          {diary.trim() || (
                            <span className="text-Slate/40 dark:text-white/20">
                              {isToday
                                ? '登录后可记录今天...'
                                : isPast
                                  ? '登录后可记录那天发生的事...'
                                  : '登录后可提前规划...'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auto-save indicator */}
            {isLoggedIn && saved && (
              <div className="px-6 py-2 border-t border-Sand dark:border-white/10">
                <span className="flex items-center justify-center gap-1.5 text-[0.8125rem] text-Sage">
                  <CheckCircle2 size={14} />
                  已自动保存
                </span>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function ProjectTag({ projectId, projects }: { projectId: string; projects: Project[] }) {
  const project = projects.find((p) => p.id === projectId)
  if (!project) return null
  return (
    <span
      className="inline-flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded text-[0.625rem] font-medium text-white"
      style={{ backgroundColor: project.color }}
    >
      {project.name}
    </span>
  )
}
