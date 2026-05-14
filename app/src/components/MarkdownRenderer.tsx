import { useState, useEffect, useCallback, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkBreaks from 'remark-breaks'
import rehypeSlug from 'rehype-slug'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import { HeadingCollapseContext } from './markdown/heading-context'
import { preprocessWikilinks } from './markdown/parser'
import { buildComponents } from './markdown/render-components'

export { parseFrontmatter, extractToc, preprocessWikilinks } from './markdown/parser'
export type { ParsedFrontmatter, TocItem } from './markdown/parser'

export interface MarkdownRendererProps {
  content: string
  existingSlugs?: string[]
  className?: string
  onWikilinkClick?: (slug: string) => void
}

export default function MarkdownRenderer({
  content,
  existingSlugs = [],
  className = '',
  onWikilinkClick,
}: MarkdownRendererProps) {
  const [collapsedHeadings, setCollapsedHeadings] = useState<Set<string>>(new Set())
  const processedContent = preprocessWikilinks(content, existingSlugs, onWikilinkClick)
  const contentRef = useRef<string | null>(null)

  const toggleHeading = useCallback((id: string) => {
    setCollapsedHeadings((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Auto-collapse all headings on new content, then apply collapse effect
  useEffect(() => {
    const container = document.querySelector('.markdown-content')
    if (!container) return

    const headings = container.querySelectorAll('h1[id], h2[id], h3[id], h4[id]')

    if (contentRef.current !== processedContent) {
      contentRef.current = processedContent
      const allIds = new Set<string>()
      headings.forEach((h) => {
        const id = h.getAttribute('id')
        if (id) allIds.add(id)
      })
      if (allIds.size > 0) {
        setCollapsedHeadings(allIds)
      }
      return
    }

    headings.forEach((heading) => {
      const id = heading.getAttribute('id')
      if (!id) return

      const isCollapsed = collapsedHeadings.has(id)
      const headingLevel = parseInt(heading.tagName.substring(1))

      let sibling = heading.nextElementSibling
      while (sibling) {
        const siblingTag = sibling.tagName.toLowerCase()

        if (siblingTag.match(/^h[1-6]$/)) {
          const siblingLevel = parseInt(siblingTag.substring(1))
          if (siblingLevel <= headingLevel) {
            break
          }
        }

        if (isCollapsed) {
          ;(sibling as HTMLElement).style.display = 'none'
        } else {
          ;(sibling as HTMLElement).style.display = ''
        }

        sibling = sibling.nextElementSibling
      }
    })
  }, [collapsedHeadings, processedContent])

  return (
    <HeadingCollapseContext.Provider value={{ collapsedHeadings, toggleHeading }}>
      <div className={`markdown-content ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
          rehypePlugins={[
            rehypeRaw,
            [rehypeKatex, { throwOnError: false, strict: false }],
            rehypeSlug,
          ]}
          components={buildComponents(existingSlugs, onWikilinkClick)}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    </HeadingCollapseContext.Provider>
  )
}
