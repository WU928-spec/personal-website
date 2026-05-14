/* ─── Calendar & Project Unified Types ─── */

export interface TimeRecord {
  id: string
  startAt: string
  endAt?: string
  duration: number
}

export interface TodoItem {
  id: string
  text: string
  done: boolean
  doneAt?: string
  timeRecords: TimeRecord[]
  projectId?: string
}

export interface DayEntry {
  date: string
  todos: TodoItem[]
  diary: string
}

/* ─── Project Types ─── */

export type ProjectStatus = 'active' | 'completed'

export interface ProjectSummary {
  id: string
  title: string
  content: string
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  color: string
  targetHours: number
  status: ProjectStatus
  createdAt: string
  parentId?: string
  summaries?: ProjectSummary[]
}

/* ─── Preset Color Palette ─── */
export const PROJECT_COLORS = [
  { value: '#C9A84C', label: '琥珀' },
  { value: '#6B8E6B', label: '鼠尾草' },
  { value: '#7A7A9D', label: '灰紫' },
  { value: '#C4783A', label: '赤陶' },
  { value: '#8B7355', label: '焦糖' },
  { value: '#4A90A4', label: '湖蓝' },
  { value: '#B85C6E', label: '玫瑰' },
  { value: '#5A7D6E', label: '松绿' },
] as const
