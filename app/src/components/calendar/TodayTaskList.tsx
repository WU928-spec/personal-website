import { useState, useEffect, useCallback } from 'react'
import { Play, Square, Clock, CheckCircle2, Circle } from 'lucide-react'
import type { DayEntry, Project } from '@/types/calendar'
import { loadProjects, generateId } from '@/utils/projectStorage'
import {
  ENTRIES_KEY,
  loadTodayEntry,
  saveTodayEntry,
  formatDurationShort,
  getTotalDuration,
  getCurrentElapsed,
  formatDateStr,
} from '@/utils/calendarStorage'
import { getProjectStats } from '@/utils/projectAggregation'
import { useLiveTick } from '@/hooks/useLiveTick'
import { useAuth } from '@/contexts/AuthContext'

/* ─── Project Timer Helpers ─── */

interface ActiveProjectTimer {
  projectId: string
  startAt: string
  date: string
}

const PROJECT_TIMER_KEY = 'active_project_timer'

function loadActiveProjectTimer(): ActiveProjectTimer | null {
  try {
    const raw = localStorage.getItem(PROJECT_TIMER_KEY)
    if (!raw) return null
    const timer = JSON.parse(raw) as ActiveProjectTimer
    if (timer.date !== formatDateStr(new Date())) return null
    return timer
  } catch {
    return null
  }
}

function saveActiveProjectTimer(timer: ActiveProjectTimer | null) {
  if (timer) localStorage.setItem(PROJECT_TIMER_KEY, JSON.stringify(timer))
  else localStorage.removeItem(PROJECT_TIMER_KEY)
}

function saveProjectTimerToEntry(projectId: string) {
  const timer = loadActiveProjectTimer()
  if (!timer || timer.projectId !== projectId) return
  const elapsed = Math.floor((Date.now() - new Date(timer.startAt).getTime()) / 1000)
  if (elapsed <= 0) return

  const entry = loadTodayEntry() || { date: formatDateStr(new Date()), todos: [], diary: '' }
  let todo = entry.todos.find((t) => t.projectId === projectId && t.text === '')
  if (!todo) {
    todo = {
      id: `pt-${projectId}-${Date.now()}`,
      text: '',
      done: true,
      timeRecords: [],
      projectId,
    }
    entry.todos.push(todo)
  }
  todo.timeRecords.push({
    id: generateId(),
    startAt: timer.startAt,
    endAt: new Date().toISOString(),
    duration: elapsed,
  })
  saveTodayEntry(entry)
  window.dispatchEvent(
    new CustomEvent('calendar-entry-saved', { detail: { date: entry.date } })
  )
}

/* Component */
export default function TodayTaskList() {
  const { isLoggedIn } = useAuth()
  const [entry, setEntry] = useState<DayEntry | null>(loadTodayEntry)
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProjectTimer, setActiveProjectTimer] = useState<ActiveProjectTimer | null>(loadActiveProjectTimer)
  const tick = useLiveTick()
  void tick // drives re-render for live timer durations

  useEffect(() => {
    setProjects(loadProjects())
    const handleFocus = () => {
      setEntry(loadTodayEntry())
      setProjects(loadProjects())
    }
    const handleSaved = (e: Event) => {
      const detail = (e as CustomEvent).detail
      const todayStr = formatDateStr(new Date())
      if (!detail?.date || detail.date === todayStr) {
        setEntry(loadTodayEntry())
      }
      setProjects(loadProjects())
    }
    const handleSyncCompleted = () => {
      setEntry(loadTodayEntry())
      setProjects(loadProjects())
      setActiveProjectTimer(loadActiveProjectTimer())
    }
    window.addEventListener('focus', handleFocus)
    window.addEventListener('calendar-entry-saved', handleSaved)
    window.addEventListener('calendar-sync-completed', handleSyncCompleted)
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('calendar-entry-saved', handleSaved)
      window.removeEventListener('calendar-sync-completed', handleSyncCompleted)
    }
  }, [])

  const refresh = useCallback(() => {
    setEntry(loadTodayEntry())
    window.dispatchEvent(new StorageEvent('storage', { key: ENTRIES_KEY }))
  }, [])

  const handleToggleTrack = useCallback(
    (todoId: string) => {
      if (!isLoggedIn) return

      // Stop project timer if active
      const pt = loadActiveProjectTimer()
      if (pt) {
        saveProjectTimerToEntry(pt.projectId)
        saveActiveProjectTimer(null)
        setActiveProjectTimer(null)
      }

      const current = loadTodayEntry()
      if (!current) return
      const todo = current.todos.find((t) => t.id === todoId)
      if (!todo) return
      const activeRecord = todo.timeRecords.find((r) => !r.endAt)

      if (activeRecord) {
        activeRecord.endAt = new Date().toISOString()
        activeRecord.duration = Math.floor(
          (new Date(activeRecord.endAt).getTime() - new Date(activeRecord.startAt).getTime()) / 1000
        )
      } else {
        current.todos.forEach((t) => {
          const other = t.timeRecords.find((r) => !r.endAt)
          if (other && t.id !== todoId) {
            other.endAt = new Date().toISOString()
            other.duration = Math.floor(
              (new Date(other.endAt).getTime() - new Date(other.startAt).getTime()) / 1000
            )
          }
        })
        todo.timeRecords.push({ id: generateId(), startAt: new Date().toISOString(), duration: 0 })
      }
      saveTodayEntry(current)
      refresh()
    },
    [refresh, isLoggedIn]
  )

  const handleToggleProjectTimer = useCallback(
    (projectId: string) => {
      if (!isLoggedIn) return
      const timer = loadActiveProjectTimer()

      if (timer?.projectId === projectId) {
        // Stop
        saveProjectTimerToEntry(projectId)
        saveActiveProjectTimer(null)
        setActiveProjectTimer(null)
        refresh()
        return
      }

      // Stop existing project timer
      if (timer) {
        saveProjectTimerToEntry(timer.projectId)
      }

      // Stop all todo timers
      const current = loadTodayEntry()
      if (current) {
        current.todos.forEach((t) => {
          const active = t.timeRecords.find((r) => !r.endAt)
          if (active) {
            active.endAt = new Date().toISOString()
            active.duration = Math.floor(
              (Date.now() - new Date(active.startAt).getTime()) / 1000
            )
          }
        })
        saveTodayEntry(current)
      }

      // Start new project timer
      const newTimer: ActiveProjectTimer = {
        projectId,
        startAt: new Date().toISOString(),
        date: formatDateStr(new Date()),
      }
      saveActiveProjectTimer(newTimer)
      setActiveProjectTimer(newTimer)
      refresh()
    },
    [refresh, isLoggedIn]
  )

  const handleToggleDone = useCallback(
    (todoId: string) => {
      if (!isLoggedIn) return
      const current = loadTodayEntry()
      if (!current) return
      const todo = current.todos.find((t) => t.id === todoId)
      if (!todo) return
      if (!todo.done) {
        const active = todo.timeRecords.find((r) => !r.endAt)
        if (active) {
          active.endAt = new Date().toISOString()
          active.duration = Math.floor(
            (new Date(active.endAt).getTime() - new Date(active.startAt).getTime()) / 1000
          )
        }
        todo.doneAt = new Date().toISOString()
      } else {
        todo.doneAt = undefined
      }
      todo.done = !todo.done
      saveTodayEntry(current)
      refresh()
    },
    [refresh, isLoggedIn]
  )

  const todos = entry?.todos || []
  const displayTodos = todos.filter((t) => !!t.text)
  const activeTodo = displayTodos.find((t) => t.timeRecords.some((r) => !r.endAt))
  const totalTrackedToday = todos.reduce((sum, t) => sum + getTotalDuration(t) + getCurrentElapsed(t), 0)

  const activeProjects = projects.filter((p) => p.status === 'active' && !p.parentId)
  const projectTimerElapsed = activeProjectTimer
    ? Math.floor((Date.now() - new Date(activeProjectTimer.startAt).getTime()) / 1000)
    : 0

  return (
    <div className="bg-white/70 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-xl p-3 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-Amber" />
          <h3 className="text-[0.75rem] font-semibold text-Ink dark:text-white">今日待办</h3>
        </div>
        <span className="text-[0.625rem] text-Slate dark:text-white/40 font-mono">
          {formatDurationShort(totalTrackedToday)}
        </span>
      </div>

      {/* Upper: Todo list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {displayTodos.length === 0 && (
          <p className="text-[0.6875rem] text-Slate/40 dark:text-white/20 text-center py-4">
            暂无今日待办
          </p>
        )}

        {displayTodos.map((todo) => {
          const isTracking = todo.timeRecords.some((r) => !r.endAt)
          const totalSec = getTotalDuration(todo) + getCurrentElapsed(todo)

          return (
            <div
              key={todo.id}
              className={`
                group flex items-center gap-1.5 rounded-lg px-2 py-1.5 border transition-all duration-200
                ${isTracking
                  ? 'bg-Amber/5 border-Amber/30'
                  : todo.done
                    ? 'bg-Sage/5 border-Sage/20 opacity-60'
                    : 'bg-transparent border-Sand dark:border-white/10'
                }
              `}
            >
              <button
                onClick={() => handleToggleDone(todo.id)}
                disabled={!isLoggedIn}
                className={`shrink-0 transition-colors ${
                  !isLoggedIn ? 'cursor-not-allowed opacity-40' : ''
                } ${
                  todo.done
                    ? 'text-Sage'
                    : 'text-Slate/30 dark:text-white/20 hover:text-Amber'
                }`}
              >
                {todo.done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              </button>

              <span
                className={`flex-1 text-[0.8125rem] truncate ${
                  todo.done
                    ? 'line-through text-Slate/40 dark:text-white/30'
                    : 'text-Ink dark:text-white/80'
                }`}
              >
                {todo.text}
                {todo.projectId && (
                  <ProjectDot
                    projectId={todo.projectId}
                    projects={projects}
                  />
                )}
              </span>

              {totalSec > 0 && (
                <span className="text-[0.625rem] font-mono text-Slate/60 dark:text-white/40 shrink-0">
                  {formatDurationShort(totalSec)}
                </span>
              )}

              <button
                onClick={() => handleToggleTrack(todo.id)}
                disabled={!isLoggedIn}
                className={`
                  shrink-0 flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200
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
        })}
      </div>

      {/* Lower: Project Timer */}
      <div className="flex-1 overflow-y-auto min-h-0 border-t border-Sand dark:border-white/10 pt-2 mt-2">
        <h4 className="text-[0.75rem] font-medium text-Slate/60 dark:text-white/40 mb-2 flex items-center gap-1.5">
          <Play size={12} />
          项目计时
        </h4>
        {activeProjects.length === 0 ? (
          <p className="text-[0.6875rem] text-Slate/40 dark:text-white/20 text-center py-2">
            暂无活跃项目
          </p>
        ) : (
          <div className="space-y-1">
            {activeProjects.map((project) => {
              const isTracking = activeProjectTimer?.projectId === project.id
              const projectStats = getProjectStats(project.id)
              const totalProjectTime = projectStats ? projectStats.totalSeconds : 0
              const displayTime = totalProjectTime + (isTracking ? projectTimerElapsed : 0)

              return (
                <div
                  key={project.id}
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
                    onClick={() => handleToggleProjectTimer(project.id)}
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
            })}
          </div>
        )}
      </div>

      {/* Active tracker indicator */}
      {activeTodo && (
        <div className="mt-2 shrink-0 flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-Amber/5 border border-Amber/20">
          <div className="w-1.5 h-1.5 rounded-full bg-Amber animate-pulse shrink-0" />
          <span className="text-[0.6875rem] text-Amber truncate flex-1">
            {activeTodo.text}
          </span>
          <span className="text-[0.75rem] font-mono text-Amber font-semibold shrink-0">
            {formatDurationShort(
              getTotalDuration(activeTodo) + getCurrentElapsed(activeTodo)
            )}
          </span>
        </div>
      )}
      {activeProjectTimer && !activeTodo && (
        <div className="mt-2 shrink-0 flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-Amber/5 border border-Amber/20">
          <div className="w-1.5 h-1.5 rounded-full bg-Amber animate-pulse shrink-0" />
          <span className="text-[0.6875rem] text-Amber truncate flex-1">
            {projects.find((p) => p.id === activeProjectTimer.projectId)?.name || ''}
          </span>
          <span className="text-[0.75rem] font-mono text-Amber font-semibold shrink-0">
            {formatDurationShort(projectTimerElapsed)}
          </span>
        </div>
      )}
    </div>
  )
}

function ProjectDot({ projectId, projects }: { projectId: string; projects: Project[] }) {
  const project = projects.find((p) => p.id === projectId)
  if (!project) return null
  return (
    <span
      className="inline-block w-2 h-2 rounded-full ml-1.5 align-middle"
      style={{ backgroundColor: project.color }}
      title={project.name}
    />
  )
}
