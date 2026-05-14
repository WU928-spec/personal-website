import type { Project } from '@/types/calendar'

export default function ProjectTag({ projectId, projects }: { projectId: string; projects: Project[] }) {
  const project = projects.find((p) => p.id === projectId)
  if (!project) return null
  return (
    <span
      className="inline-flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded text-[0.625rem] font-medium text-white"
      style={{ backgroundColor: project.color }}
    >
      {project.name}
    </span>
  )
}
