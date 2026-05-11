import type { ReactNode } from 'react'

interface StatBadgeProps {
  icon: ReactNode
  label: string
  value: string
}

export default function ProjectStatBadge({ icon, label, value }: StatBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 text-Slate/60 dark:text-white/40">
      {icon}
      <span className="text-[0.625rem]">{label}</span>
      <span className="text-[0.75rem] font-medium text-Ink dark:text-white/70">{value}</span>
    </div>
  )
}
