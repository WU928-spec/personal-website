import type { ReactNode } from 'react'

interface HomeSectionProps {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export default function HomeSection({ eyebrow, title, description, action, children, className = '' }: HomeSectionProps) {
  return (
    <section className={`py-20 md:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="mb-10 flex flex-col justify-between gap-5 border-b border-Sand/70 pb-7 dark:border-white/10 sm:flex-row sm:items-end">
          <div>
            <p className="font-ui text-label uppercase tracking-[0.16em] text-Amber">{eyebrow}</p>
            <h2 className="mt-3 font-display text-heading font-medium text-Ink dark:text-white">{title}</h2>
            {description && <p className="mt-3 max-w-xl text-body leading-relaxed text-Slate">{description}</p>}
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  )
}
