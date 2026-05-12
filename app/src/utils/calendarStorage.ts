import type { DayEntry, TodoItem } from '@/types/calendar'
import { supabase, isSupabaseReady } from '@/lib/supabase'

export const ENTRIES_KEY = 'calendar_entries'

/* ─── Local helpers ─── */
function loadLocalAll(): Record<string, DayEntry> {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveLocalAll(all: Record<string, DayEntry>) {
  try {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(all))
  } catch {
    // ignore
  }
}

function normalizeEntry(entry: DayEntry): DayEntry {
  return {
    ...entry,
    todos: (entry.todos || []).map((t) => ({
      ...t,
      timeRecords: t.timeRecords || [],
    })),
  }
}

/* ─── Supabase helpers ─── */
async function fetchAllEntriesFromSupabase(): Promise<Record<string, DayEntry>> {
  if (!isSupabaseReady()) return {}
  const { data, error } = await supabase!.from('calendar_entries').select('*')
  if (error || !data) return {}
  const map: Record<string, DayEntry> = {}
  for (const row of data as Record<string, unknown>[]) {
    const date = String(row.date)
    map[date] = normalizeEntry({
      date,
      todos: Array.isArray(row.todos) ? row.todos : [],
      diary: String(row.diary || ''),
    })
  }
  return map
}

async function upsertEntryToSupabase(entry: DayEntry) {
  if (!isSupabaseReady()) return
  await supabase!.from('calendar_entries').upsert({
    date: entry.date,
    todos: entry.todos,
    diary: entry.diary,
  })
}

/* ─── Entry CRUD ─── */

export function loadEntry(dateStr: string): DayEntry | null {
  const all = loadLocalAll()
  const entry = all[dateStr]
  return entry ? normalizeEntry(entry) : null
}

export function loadAllEntries(): Record<string, DayEntry> {
  const all = loadLocalAll()
  return Object.fromEntries(
    Object.entries(all).map(([k, v]) => [k, normalizeEntry(v)])
  )
}

export function saveEntry(entry: DayEntry) {
  const all = loadLocalAll()
  all[entry.date] = entry
  saveLocalAll(all)
  // Async sync to Supabase — never block UI
  upsertEntryToSupabase(entry).catch((e) =>
    console.warn('Calendar Supabase sync failed:', e)
  )
}

export function loadTodayEntry(): DayEntry | null {
  return loadEntry(formatDateStr(new Date()))
}

export function saveTodayEntry(entry: DayEntry) {
  saveEntry(entry)
}

/**
 * Background sync: load from Supabase and update localStorage.
 * Call this on app mount or page focus.
 */
export async function syncCalendarEntries(): Promise<boolean> {
  if (!isSupabaseReady()) return false
  try {
    const remote = await fetchAllEntriesFromSupabase()
    const local = loadLocalAll()
    // Merge: remote wins for same date
    const merged = { ...local, ...remote }
    saveLocalAll(merged)
    // Notify all components that sync completed
    window.dispatchEvent(new CustomEvent('calendar-sync-completed'))
    return true
  } catch (e) {
    console.warn('Calendar sync failed:', e)
    return false
  }
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
