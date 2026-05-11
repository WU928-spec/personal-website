import type { Project, DayEntry, TodoItem } from '@/types/calendar'
import { loadProjects } from './projectStorage'

const ENTRIES_KEY = 'calendar_entries'

/* ─── Helpers ─── */

export function formatDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function getTotalDuration(todo: TodoItem): number {
  return todo.timeRecords.reduce((sum, r) => sum + (r.duration || 0), 0)
}

function getCurrentElapsed(todo: TodoItem): number {
  const active = todo.timeRecords.find((r) => !r.endAt)
  if (!active) return 0
  return Math.floor((Date.now() - new Date(active.startAt).getTime()) / 1000)
}

function loadAllEntries(): Record<string, DayEntry> {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

/* ─── Aggregation: calendar → project stats ─── */

export interface ProjectStat {
  project: Project
  totalSeconds: number
  totalTodos: number
  doneTodos: number
  dailyBreakdown: { date: string; seconds: number; todos: TodoItem[] }[]
}

export function getProjectStats(projectId: string): ProjectStat | null {
  const projects = loadProjects()
  const project = projects.find((p) => p.id === projectId)
  if (!project) return null

  // 收集本项目 + 所有子项目的 ID
  const projectIds = new Set([projectId])
  const subProjects = projects.filter((p) => p.parentId === projectId)
  subProjects.forEach((sp) => projectIds.add(sp.id))

  const allEntries = loadAllEntries()
  const dailyBreakdown: ProjectStat['dailyBreakdown'] = []
  let totalSeconds = 0
  let totalTodos = 0
  let doneTodos = 0

  for (const [date, entry] of Object.entries(allEntries)) {
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

export function getAllProjectStats(): ProjectStat[] {
  const projects = loadProjects()
  return projects
    .map((p) => getProjectStats(p.id))
    .filter((s): s is ProjectStat => s !== null)
}

/* ─── Recent N days breakdown ─── */

export function getRecentDaysBreakdown(
  projectId: string,
  days: number
): { date: string; seconds: number }[] {
  const result: { date: string; seconds: number }[] = []
  const today = new Date()
  const allEntries = loadAllEntries()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = formatDateStr(d)
    const entry = allEntries[dateStr]
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
