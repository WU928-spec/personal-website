import type { Project, DayEntry, TodoItem } from '@/types/calendar'
import { loadProjects } from './projectStorage'
import { formatDateStr, getTotalDuration, getCurrentElapsed, loadAllEntries } from './calendarStorage'

/* ─── Helpers ─── */

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function formatDurationShort(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}`
  return `${m}m`
}

/* ─── Aggregation: calendar → project stats ─── */

export interface ProjectStat {
  project: Project
  totalSeconds: number
  totalTodos: number
  doneTodos: number
  dailyBreakdown: { date: string; seconds: number; todos: TodoItem[] }[]
}

export function getProjectStats(
  projectId: string,
  allProjects?: Project[],
  allEntries?: Record<string, DayEntry>
): ProjectStat | null {
  const projects = allProjects ?? loadProjects()
  const project = projects.find((p) => p.id === projectId)
  if (!project) return null

  // 收集本项目 + 所有子项目的 ID
  const projectIds = new Set([projectId])
  const subProjects = projects.filter((p) => p.parentId === projectId)
  subProjects.forEach((sp) => projectIds.add(sp.id))

  const entries = allEntries ?? loadAllEntries()
  const dailyBreakdown: ProjectStat['dailyBreakdown'] = []
  let totalSeconds = 0
  let totalTodos = 0
  let doneTodos = 0

  for (const [date, entry] of Object.entries(entries)) {
    const projectTodos = entry.todos.filter((t) => t.projectId && projectIds.has(t.projectId))
    if (projectTodos.length === 0) continue

    const daySeconds = projectTodos.reduce(
      (sum, t) => sum + getTotalDuration(t) + getCurrentElapsed(t),
      0
    )

    totalSeconds += daySeconds
    totalTodos += projectTodos.length
    doneTodos += projectTodos.filter((t) => t.done).length

    dailyBreakdown.push({
      date,
      seconds: daySeconds,
      todos: projectTodos,
    })
  }

  dailyBreakdown.sort((a, b) => a.date.localeCompare(b.date))

  return {
    project,
    totalSeconds,
    totalTodos,
    doneTodos,
    dailyBreakdown,
  }
}

/* ─── Recent N days breakdown ─── */

export function getRecentDaysBreakdown(
  projectId: string,
  days: number,
  allEntries?: Record<string, DayEntry>
): { date: string; seconds: number }[] {
  const result: { date: string; seconds: number }[] = []
  const today = new Date()
  const entries = allEntries ?? loadAllEntries()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = formatDateStr(d)
    const entry = entries[dateStr]
    const seconds = entry
      ? entry.todos
          .filter((t) => t.projectId === projectId)
          .reduce(
            (sum, t) =>
              sum +
              t.timeRecords.reduce((s, r) => s + (r.duration || 0), 0) +
              (t.timeRecords.find((r) => !r.endAt)
                ? Math.floor(
                    (Date.now() -
                      new Date(
                        t.timeRecords.find((r) => !r.endAt)!.startAt
                      ).getTime()) /
                      1000
                  )
                : 0),
            0
          )
      : 0
    result.push({ date: dateStr, seconds })
  }

  return result
}
