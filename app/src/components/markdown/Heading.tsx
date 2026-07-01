import { useContext } from 'react'
import { ChevronRight } from 'lucide-react'
import { HeadingCollapseContext } from './heading-context'

const sizes = {
  1: 'font-display text-display font-bold leading-[1.1]',
  2: 'font-display text-heading font-medium leading-[1.2]',
  3: 'font-display text-subhead font-semibold leading-[1.3]',
  4: 'font-body text-body font-semibold leading-[1.4] tracking-[0.01em]',
}

const iconSizes = { 1: 22, 2: 20, 3: 18, 4: 16 }

const margins = {
  1: 'mt-8 mb-4',
  2: 'mt-8 mb-3',
  3: 'mt-8 mb-2',
  4: 'mt-6 mb-2',
}

export default function makeHeading(level: 1 | 2 | 3 | 4) {
  const Tag = `h${level}` as const

  return function HeadingComponent({ children, id }: { children?: React.ReactNode; id?: string }) {
    const { collapsedHeadings, toggleHeading } = useContext(HeadingCollapseContext)
    const isCollapsed = id ? collapsedHeadings.has(id) : false

    return (
      <Tag
        id={id}
        className={`${sizes[level]} text-primary scroll-mt-[80px] group flex items-center gap-2 cursor-pointer ${margins[level]}`}
        onClick={() => id && toggleHeading(id)}
      >
        <ChevronRight
          size={iconSizes[level]}
          className={`shrink-0 text-primary transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}
        />
        <span className="flex-1">{children}</span>
        <a
          href={`#${id}`}
          className="anchor ml-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 no-underline"
          aria-hidden="true"
          onClick={(e) => e.stopPropagation()}
        >
          ¶
        </a>
      </Tag>
    )
  }
}
