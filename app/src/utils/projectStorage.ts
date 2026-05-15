import type { Project, ProjectSummary } from '@/types/calendar'
import { supabase, isSupabaseReady } from '@/lib/supabase'
import { createStorageKey } from './storage'

const PROJECTS_KEY = 'calendar_projects'
const projectStorage = createStorageKey<Project[]>(PROJECTS_KEY, [])

/* ─── Supabase helpers ─── */
async function fetchFromSupabase(): Promise<Project[]> {
  if (!isSupabaseReady()) return []
  const { data, error } = await supabase!.from('projects').select('*')
  if (error || !data) return []
  return (data as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    description: row.description ? String(row.description) : undefined,
    color: row.color ? String(row.color) : '#C9A84C',
    targetHours: Number(row.target_hours || 0),
    status: String(row.status || 'active') as Project['status'],
    createdAt: String(row.created_at),
    parentId: row.parent_id ? String(row.parent_id) : undefined,
    summaries: row.summaries ? (row.summaries as ProjectSummary[]) : undefined,
  }))
}

async function upsertToSupabase(project: Project) {
  if (!isSupabaseReady()) return
  await supabase!.from('projects').upsert({
    id: project.id,
    name: project.name,
    description: project.description,
    color: project.color,
    target_hours: project.targetHours,
    status: project.status,
    parent_id: project.parentId,
    created_at: project.createdAt,
    summaries: project.summaries,
  })
}

/* ─── Summary helpers ─── */

export function addProjectSummary(projectId: string, title: string, content: string) {
  const projects = loadProjects()
  const p = projects.find((x) => x.id === projectId)
  if (!p) return
  if (!p.summaries) p.summaries = []
  p.summaries.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    content,
    createdAt: new Date().toISOString(),
  })
  projectStorage.save(projects)
}

export function deleteProjectSummary(projectId: string, summaryId: string) {
  const projects = loadProjects()
  const p = projects.find((x) => x.id === projectId)
  if (!p || !p.summaries) return
  p.summaries = p.summaries.filter((s) => s.id !== summaryId)
  projectStorage.save(projects)
}

async function deleteFromSupabase(projectId: string) {
  if (!isSupabaseReady()) return
  await supabase!.from('projects').delete().eq('id', projectId)
}

/* ─── Project CRUD ─── */

export function loadProjects(): Project[] {
  return projectStorage.load()
}

export function saveProjects(projects: Project[]) {
  projectStorage.save(projects)
}

export function addProject(project: Project) {
  const projects = loadProjects()
  projects.push(project)
  projectStorage.save(projects)
  upsertToSupabase(project).catch(() => {})
}

export function updateProject(updated: Project) {
  const projects = loadProjects()
  const idx = projects.findIndex((p) => p.id === updated.id)
  if (idx >= 0) {
    projects[idx] = updated
    projectStorage.save(projects)
    upsertToSupabase(updated).catch(() => {})
  }
}

export function deleteProject(projectId: string) {
  const projects = loadProjects()
  const toDelete = new Set([projectId])
  projects.forEach((p) => {
    if (p.parentId && toDelete.has(p.parentId)) toDelete.add(p.id)
  })
  const next = projects.filter((p) => !toDelete.has(p.id))
  projectStorage.save(next)

  toDelete.forEach((id) => {
    deleteFromSupabase(id).catch(() => {})
  })
}

export function completeProject(projectId: string) {
  const projects = loadProjects()
  const p = projects.find((x) => x.id === projectId)
  if (p) {
    p.status = 'completed'
    projectStorage.save(projects)
    upsertToSupabase(p).catch(() => {})
  }
}

export function activateProject(projectId: string) {
  const projects = loadProjects()
  const p = projects.find((x) => x.id === projectId)
  if (p) {
    p.status = 'active'
    projectStorage.save(projects)
    upsertToSupabase(p).catch(() => {})
  }
}

export function getActiveProjects(): Project[] {
  return loadProjects().filter((p) => p.status === 'active' && !p.parentId)
}

export function getSubProjects(parentId: string): Project[] {
  return loadProjects().filter((p) => p.parentId === parentId)
}

/**
 * Background sync: load from Supabase and update localStorage.
 */
export async function syncProjects(): Promise<boolean> {
  if (!isSupabaseReady()) return false
  try {
    const remote = await fetchFromSupabase()
    projectStorage.save(remote)
    return true
  } catch {
    return false
  }
}

/* ─── Helpers ─── */

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
