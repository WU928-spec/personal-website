import type { Project } from '@/types/calendar'

const PROJECTS_KEY = 'calendar_projects'

/* ─── Project CRUD ─── */

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

export function addProject(project: Project) {
  const projects = loadProjects()
  projects.push(project)
  saveProjects(projects)
}

export function updateProject(updated: Project) {
  const projects = loadProjects()
  const idx = projects.findIndex((p) => p.id === updated.id)
  if (idx >= 0) {
    projects[idx] = updated
    saveProjects(projects)
  }
}

export function deleteProject(projectId: string) {
  const projects = loadProjects()
  // 级联删除子项目
  const toDelete = new Set([projectId])
  projects.forEach((p) => {
    if (p.parentId && toDelete.has(p.parentId)) toDelete.add(p.id)
  })
  saveProjects(projects.filter((p) => !toDelete.has(p.id)))
}

export function completeProject(projectId: string) {
  const projects = loadProjects()
  const p = projects.find((x) => x.id === projectId)
  if (p) {
    p.status = 'completed'
    saveProjects(projects)
  }
}

export function activateProject(projectId: string) {
  const projects = loadProjects()
  const p = projects.find((x) => x.id === projectId)
  if (p) {
    p.status = 'active'
    saveProjects(projects)
  }
}

export function getActiveProjects(): Project[] {
  return loadProjects().filter((p) => p.status === 'active' && !p.parentId)
}

export function getSubProjects(parentId: string): Project[] {
  return loadProjects().filter((p) => p.parentId === parentId)
}

/* ─── Helpers ─── */

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
