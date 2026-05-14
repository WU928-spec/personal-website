import type { Project } from '@/types/calendar'
import { supabase, isSupabaseReady } from '@/lib/supabase'

const PROJECTS_KEY = 'calendar_projects'

/* ─── Local helpers ─── */
function loadLocal(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveLocal(projects: Project[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

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
  })
}

/* ─── Summary helpers (localStorage only, not synced to Supabase) ─── */

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
  saveLocal(projects)
}

export function deleteProjectSummary(projectId: string, summaryId: string) {
  const projects = loadProjects()
  const p = projects.find((x) => x.id === projectId)
  if (!p || !p.summaries) return
  p.summaries = p.summaries.filter((s) => s.id !== summaryId)
  saveLocal(projects)
}

async function deleteFromSupabase(projectId: string) {
  if (!isSupabaseReady()) return
  await supabase!.from('projects').delete().eq('id', projectId)
}

/* ─── Project CRUD ─── */

export function loadProjects(): Project[] {
  return loadLocal()
}

export function saveProjects(projects: Project[]) {
  saveLocal(projects)
}

export function addProject(project: Project) {
  const projects = loadProjects()
  projects.push(project)
  saveLocal(projects)
  upsertToSupabase(project).catch((e) =>
    console.warn('Project add Supabase sync failed:', e)
  )
}

export function updateProject(updated: Project) {
  const projects = loadProjects()
  const idx = projects.findIndex((p) => p.id === updated.id)
  if (idx >= 0) {
    projects[idx] = updated
    saveLocal(projects)
    upsertToSupabase(updated).catch((e) =>
      console.warn('Project update Supabase sync failed:', e)
    )
  }
}

export function deleteProject(projectId: string) {
  const projects = loadProjects()
  const toDelete = new Set([projectId])
  projects.forEach((p) => {
    if (p.parentId && toDelete.has(p.parentId)) toDelete.add(p.id)
  })
  const next = projects.filter((p) => !toDelete.has(p.id))
  saveLocal(next)

  toDelete.forEach((id) => {
    deleteFromSupabase(id).catch((e) =>
      console.warn('Project delete Supabase sync failed:', e)
    )
  })
}

export function completeProject(projectId: string) {
  const projects = loadProjects()
  const p = projects.find((x) => x.id === projectId)
  if (p) {
    p.status = 'completed'
    saveLocal(projects)
    upsertToSupabase(p).catch((e) =>
      console.warn('Project complete Supabase sync failed:', e)
    )
  }
}

export function activateProject(projectId: string) {
  const projects = loadProjects()
  const p = projects.find((x) => x.id === projectId)
  if (p) {
    p.status = 'active'
    saveLocal(projects)
    upsertToSupabase(p).catch((e) =>
      console.warn('Project activate Supabase sync failed:', e)
    )
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
    saveLocal(remote)
    return true
  } catch (e) {
    console.warn('Projects sync failed:', e)
    return false
  }
}

/* ─── Helpers ─── */

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
