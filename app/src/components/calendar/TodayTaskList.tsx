import { useState, useEffect, useCallback } from 'react'
import { Play, Clock } from 'lucide-react'
import type { DayEntry, Project } from '@/types/calendar'
import { loadProjects, generateId } from '@/utils/projectStorage'
import {
  ENTRIES_KEY,
  loadTodayEntry,
  saveTodayEntry,
  getTotalDuration,
  getCurrentElapsed,
  formatDateStr,
} from '@/utils/calendarStorage'
import { formatDurationShort } from '@/utils/projectAggregation'
import { getProjectStats } from '@/utils/projectAggregation'
import {
  loadActiveProjectTimer,
  saveActiveProjectTimer,
} from '@/utils/projectTimerStorage'
import type { ActiveProjectTimer } from '@/utils/projectTimerStorage'
import { useLiveTick } from '@/hooks/useLiveTick'
import { useAuth } from '@/contexts/AuthContext'
import TodoItem from './TodoItem'
import ProjectTimerItem from './ProjectTimerItem'

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

  const handleSaveTimeRecords = useCallback(
    (todoId: string, records: { id: string; duration: number }[]) => {
      if (!isLoggedIn) return
      const current = loadTodayEntry()
      if (!current) return
      const todo = current.todos.find((t) => t.id === todoId)
      if (!todo) return
      todo.timeRecords = records.map((d) => {
        const original = todo.timeRecords.find((r) => r.id === d.id)
        return {
          id: d.id,
          startAt: original?.startAt || new Date().toISOString(),
          endAt: original?.endAt || new Date().toISOString(),
          duration: Math.max(0, d.duration),
        }
      })
      saveTodayEntry(current)
      refresh()
    },
    [isLoggedIn, refresh]
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
    <div className="bg-white/70 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-lg p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-Amber" />
          <h3 className="text-label font-semibold text-Ink dark:text-white">今日待办</h3>
        </div>
        <span className="text-[0.625rem] text-Slate dark:text-white/40 font-mono">
          {formatDurationShort(totalTrackedToday)}
        </span>
      </div>

      {/* Upper: Todo list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {displayTodos.length === 0 && (
          <p className="text-label text-Slate/40 dark:text-white/20 text-center py-4">
            暂无今日待办
          </p>
        )}

        {displayTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            projects={projects}
            isLoggedIn={isLoggedIn}
            onToggleDone={() => handleToggleDone(todo.id)}
            onToggleTrack={() => handleToggleTrack(todo.id)}
            onSaveTimeRecords={(records) => handleSaveTimeRecords(todo.id, records)}
          />
        ))}
      </div>

      {/* Lower: Project Timer */}
      <div className="flex-1 overflow-y-auto min-h-0 border-t border-Sand dark:border-white/10 pt-2 mt-2">
        <h4 className="text-label font-medium text-Slate/60 dark:text-white/40 mb-2 flex items-center gap-1.5">
          <Play size={12} />
          项目计时
        </h4>
        {activeProjects.length === 0 ? (
          <p className="text-label text-Slate/40 dark:text-white/20 text-center py-2">
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
                <ProjectTimerItem
                  key={project.id}
                  project={project}
                  isTracking={isTracking}
                  isLoggedIn={isLoggedIn}
                  displayTime={displayTime}
                  onToggleTimer={() => handleToggleProjectTimer(project.id)}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Active tracker indicator */}
      {activeTodo && (
        <div className="mt-2 shrink-0 flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-Amber/5 border border-Amber/20">
          <div className="w-1.5 h-1.5 rounded bg-Amber animate-pulse shrink-0" />
          <span className="text-label text-Amber truncate flex-1">
            {activeTodo.text}
          </span>
          <span className="text-label font-mono text-Amber font-semibold shrink-0">
            {formatDurationShort(
              getTotalDuration(activeTodo) + getCurrentElapsed(activeTodo)
            )}
          </span>
        </div>
      )}
      {activeProjectTimer && !activeTodo && (
        <div className="mt-2 shrink-0 flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-Amber/5 border border-Amber/20">
          <div className="w-1.5 h-1.5 rounded bg-Amber animate-pulse shrink-0" />
          <span className="text-label text-Amber truncate flex-1">
            {projects.find((p) => p.id === activeProjectTimer.projectId)?.name || ''}
          </span>
          <span className="text-label font-mono text-Amber font-semibold shrink-0">
            {formatDurationShort(projectTimerElapsed)}
          </span>
        </div>
      )}
    </div>
  )
}


