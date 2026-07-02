import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, CalendarCheck, CheckCircle2 } from 'lucide-react'
import { getLunarDate, getDayDetail, getSolarTerms } from 'chinese-days'
import type { TodoItem, Project } from '@/types/calendar'
import { loadProjects, generateId } from '@/utils/projectStorage'
import { loadEntry, saveEntry, formatDateStr } from '@/utils/calendarStorage'
import { useAuth } from '@/contexts/AuthContext'
import PlanTab from './day-detail/PlanTab'
import DiaryTab from './day-detail/DiaryTab'

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
  if (!date) return null

  return (
    <DayDetailPanelContent
      date={date}
      isOpen={isOpen}
      onClose={onClose}
      onEntryChange={onEntryChange}
    />
  )
}

interface DayDetailPanelContentProps extends Omit<DayDetailPanelProps, 'date'> {
  date: Date
}

function DayDetailPanelContent({
  date,
  isOpen,
  onClose,
  onEntryChange,
}: DayDetailPanelContentProps) {
  const { isLoggedIn } = useAuth()

  const dateStr = formatDateStr(date)
  const todayStr = formatDateStr(new Date())
  const isToday = dateStr === todayStr
  const isPast = dateStr < todayStr

  const lunar = getLunarDate(dateStr)
  const dayDetail = getDayDetail(dateStr)
  const solarTerms = getSolarTerms(dateStr)
  const holidayCnName = dayDetail?.name?.split(',')[1]
  const term = solarTerms?.[0]
  const dateTitle = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  const lunarText = holidayCnName || term?.name || `${lunar.lunarMonCN}${lunar.lunarDayCN}`
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]

  const [activeTab, setActiveTab] = useState<'plan' | 'diary'>(isPast ? 'diary' : 'plan')
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [diary, setDiary] = useState('')
  const [newTodo, setNewTodo] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [saved, setSaved] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInitialLoad = useRef(true)

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
    setActiveTab(isPast ? 'diary' : 'plan')
    setSaved(false)
  }, [isOpen, date, dateStr, isPast])

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

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }
    const timer = setTimeout(() => autoSave(), 500)
    return () => clearTimeout(timer)
  }, [todos, diary, autoSave])

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[520px] bg-Parchment dark:bg-Graphite border-l border-Sand dark:border-white/10 z-50 flex flex-col shadow-deep"
          >
            <div className="px-6 pt-5 pb-3 border-b border-Sand dark:border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <h2 className="font-display text-heading font-semibold text-Ink dark:text-white">
                      {dateTitle}
                    </h2>
                    <span className="text-caption text-Slate dark:text-white/50">
                      {weekday}
                    </span>
                  </div>
                  <p className="text-label text-Slate/70 dark:text-white/40 mt-0.5">
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

              <div className="flex items-center gap-1 mt-4 bg-Mist/50 dark:bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('plan')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-md text-caption font-medium transition-all duration-200 ${
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
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-md text-caption font-medium transition-all duration-200 ${
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

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <AnimatePresence mode="wait">
                {activeTab === 'plan' && (
                  <motion.div
                    key="plan"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PlanTab
                      todos={todos}
                      onToggleTodo={toggleTodo}
                      onRemoveTodo={removeTodo}
                      newTodo={newTodo}
                      onNewTodoChange={setNewTodo}
                      onAddTodo={addTodo}
                      selectedProjectId={selectedProjectId}
                      onProjectChange={setSelectedProjectId}
                      projects={projects}
                      isLoggedIn={isLoggedIn}
                      isPast={isPast}
                    />
                  </motion.div>
                )}

                {activeTab === 'diary' && (
                  <motion.div
                    key="diary"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DiaryTab
                      todos={todos}
                      diary={diary}
                      onDiaryChange={setDiary}
                      isToday={isToday}
                      isPast={isPast}
                      isLoggedIn={isLoggedIn}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isLoggedIn && saved && (
              <div className="px-6 py-2 border-t border-Sand dark:border-white/10">
                <span className="flex items-center justify-center gap-1.5 text-caption text-Sage">
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
