import type { DayEntry, TodoItem } from '@/types/calendar'

export const ENTRIES_KEY = 'calendar_entries'

/* ─── Entry CRUD ─── */

export function loadEntry(dateStr: string): DayEntry | null {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY)
    if (!raw) return null
    const all: Record<string, DayEntry> = JSON.parse(raw)
    const entry = all[dateStr]
    if (entry) {
      entry.todos = entry.todos.map((t) => ({
        ...t,
        timeRecords: t.timeRecords || [],
      }))
    }
    return entry || null
  } catch {
    return null
  }
}

export function loadAllEntries(): Record<string, DayEntry> {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function saveEntry(entry: DayEntry) {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY)
    const all: Record<string, DayEntry> = raw ? JSON.parse(raw) : {}
    all[entry.date] = entry
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(all))
  } catch (error) {
    console.error('Failed to save calendar entry:', error)
  }
}

export function loadTodayEntry(): DayEntry | null {
  const todayStr = formatDateStr(new Date())
  return loadEntry(todayStr)
}

export function saveTodayEntry(entry: DayEntry) {
  saveEntry(entry)
}

/* ─── Time helpers ─── */

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

export function formatDurationShort(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}`
  return `${m}m`
}

export function getTotalDuration(todo: TodoItem): number {
  return todo.timeRecords.reduce((sum, r) => sum + (r.duration || 0), 0)
}

export function getCurrentElapsed(todo: TodoItem): number {
  const active = todo.timeRecords.find((r) => !r.endAt)
  if (!active) return 0
  return Math.floor((Date.now() - new Date(active.startAt).getTime()) / 1000)
}

export function getDayTotalDuration(entry: DayEntry | null): number {
  if (!entry) return 0
  return entry.todos.reduce((sum, t) => sum + getTotalDuration(t) + getCurrentElapsed(t), 0)
}
