import { useContext } from 'react'
import { ChevronRight } from 'lucide-react'
import { HeadingCollapseContext } from './heading-context'

const sizes = {
  1: 'font-display text-[clamp(2rem,3vw,2.75rem)] font-bold leading-[1.1]',
  2: 'font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-medium leading-[1.2]',
  3: 'font-display text-[1.25rem] font-semibold leading-[1.3]',
  4: 'font-body text-[1rem] font-semibold leading-[1.4] tracking-[0.01em]',
}

const iconSizes = { 1: 22, 2: 20, 3: 18, 4: 16 }

const margins = {
  1: 'mt-[2em] mb-[1em]',
  2: 'mt-[2.5em] mb-[0.8em]',
  3: 'mt-[2em] mb-[0.6em]',
  4: 'mt-[1.5em] mb-[0.5em]',
}

export default function makeHeading(level: 1 | 2 | 3 | 4) {
  const Tag = `h${level}` as const

  return function HeadingComponent({ children, id }: { children?: React.ReactNode; id?: string }) {
    const { collapsedHeadings, toggleHeading } = useContext(HeadingCollapseContext)
    const isCollapsed = id ? collapsedHeadings.has(id) : false

    return (
      <Tag
        id={id}
        className={`${sizes[level]} text-Ink scroll-mt-[80px] group flex items-center gap-2 cursor-pointer ${margins[level]}`}
        onClick={() => id && toggleHeading(id)}
      >
        <ChevronRight
          size={iconSizes[level]}
          className={`shrink-0 text-Amber transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}
        />
        <span className="flex-1">{children}</span>
        <a
          href={`#${id}`}
          className="anchor ml-2 text-Amber opacity-0 group-hover:opacity-100 transition-opacity duration-200 no-underline"
          aria-hidden="true"
          onClick={(e) => e.stopPropagation()}
        >
          ¶
        </a>
      </Tag>
    )
  }
}
