import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkBreaks from 'remark-breaks'
import rehypeSlug from 'rehype-slug'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import { createHighlighter, type ThemeInput } from 'shiki'
import matter from 'gray-matter'
import { Link } from 'react-router-dom'
import { Copy, Check, Lightbulb, AlertTriangle, Info, ChevronRight } from 'lucide-react'

/* ───────────────────────────────────────────────
   Heading Collapse Context
   ─────────────────────────────────────────────── */
interface HeadingCollapseContextType {
  collapsedHeadings: Set<string>
  toggleHeading: (id: string) => void
}

const HeadingCollapseContext = createContext<HeadingCollapseContextType>({
  collapsedHeadings: new Set(),
  toggleHeading: () => {},
})

/* ───────────────────────────────────────────────
   Shiki warm theme (amber / sage / gold / rose)
   ─────────────────────────────────────────────── */
const warmGardenTheme: ThemeInput = {
  name: 'warm-garden',
  type: 'dark',
  colors: {
    'editor.background': '#1E1C1A',
    'editor.foreground': '#F7F4EF',
    'editor.lineHighlight.background': '#2D2A26',
    'editor.selection.background': '#C4783A40',
  },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#D4C5B5', fontStyle: 'italic' },
    },
    {
      scope: ['keyword', 'storage.type', 'storage.modifier'],
      settings: { foreground: '#C4783A' },
    },
    {
      scope: [
        'string',
        'string.quoted',
        'string.template',
        'punctuation.definition.string',
      ],
      settings: { foreground: '#6B8E6B' },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call'],
      settings: { foreground: '#C9A84C' },
    },
    {
      scope: ['variable', 'identifier', 'meta.definition.variable.name'],
      settings: { foreground: '#F7F4EF' },
    },
    {
      scope: ['constant.numeric', 'constant'],
      settings: { foreground: '#B8695A' },
    },
    {
      scope: ['entity.name.type', 'support.type', 'entity.name.class'],
      settings: { foreground: '#C9A84C' },
    },
    {
      scope: ['operator', 'punctuation', 'meta.brace'],
      settings: { foreground: '#D4C5B5' },
    },
    {
      scope: ['entity.name.tag', 'support.class.component'],
      settings: { foreground: '#C4783A' },
    },
    {
      scope: ['attribute.name', 'entity.other.attribute-name'],
      settings: { foreground: '#C9A84C' },
    },
    {
      scope: ['invalid', 'error'],
      settings: { foreground: '#B8695A' },
    },
  ],
}

/* ───────────────────────────────────────────────
   Singleton highlighter
   ─────────────────────────────────────────────── */
let highlighterPromise: ReturnType<typeof createHighlighter> | null = null

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [warmGardenTheme],
      langs: [
        'typescript',
        'javascript',
        'python',
        'yaml',
        'json',
        'bash',
        'shell',
        'html',
        'css',
        'markdown',
        'tsx',
        'jsx',
        'rust',
        'go',
        'sql',
        'java',
        'c',
        'cpp',
        'ruby',
        'php',
        'perl',
        'swift',
        'kotlin',
      ],
    })
  }
  return highlighterPromise
}

/* ───────────────────────────────────────────────
   Frontmatter parsing
   ─────────────────────────────────────────────── */
export interface ParsedFrontmatter {
  title?: string
  date?: string
  tags?: string[]
  excerpt?: string
  [key: string]: unknown
}

export function parseFrontmatter(content: string): {
  frontmatter: ParsedFrontmatter
  body: string
} {
  const parsed = matter(content)
  return {
    frontmatter: parsed.data as ParsedFrontmatter,
    body: parsed.content,
  }
}

/* ───────────────────────────────────────────────
   Wikilink pre-processing
   ─────────────────────────────────────────────── */
function slugifyWikilink(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9一-龥\-_]/g, '')
    .substring(0, 60)
}

export function preprocessWikilinks(
  content: string,
  existingSlugs: string[],
  onWikilinkClick?: (slug: string) => void
): string {
  if (!content) return ''

  // Normalize Obsidian-style $$$$ display math to two separate $$ blocks
  let processed = content.replace(/\$\$\$\$/g, '$$\n\n$$')

  // Strip $$...$$ wrappers that don't contain LaTeX commands (Obsidian-like behavior)
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, inner: string) => {
    // If the content contains a backslash command, keep it as math
    if (/\\[a-zA-Z]+/.test(inner)) {
      return match
    }
    // Otherwise treat as plain text (remove the $$ delimiters)
    return inner.trim()
  })

  const resolve = (title: string, display: string): string => {
    const slug = slugifyWikilink(title.trim())
    const safeDisplay = display.trim()

    if (existingSlugs.includes(slug)) {
      if (onWikilinkClick) {
        // Use a special marker that we'll handle in the link component
        return `[${safeDisplay}](obsidian-internal://${slug})`
      }
      return `[${safeDisplay}](/obsidian?note=${slug})`
    }
    return `<span class="obsidian-wikilink-unresolved" title="Note not yet published">${safeDisplay}</span>`
  }

  // [[#Heading]] - internal anchor links (must be processed before other wikilinks)
  processed = processed.replace(
    /\[\[#([^\]|]+)\|([^\]]+)\]\]/g,
    (_match, heading: string, display: string) => {
      const headingId = heading.trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
      return `[${display.trim()}](#${headingId})`
    }
  )
  processed = processed.replace(
    /\[\[#([^\]|]+)\]\]/g,
    (_match, heading: string) => {
      const headingText = heading.trim()
      const headingId = headingText
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
      return `[${headingText}](#${headingId})`
    }
  )

  // [[file.pdf#page=...&selection=...|Display]] - PDF annotations (convert to plain text)
  processed = processed.replace(
    /\[\[([^|\]]+\.pdf[^|\]]*)\|([^\]]+)\]\]/g,
    (_match, _pdfPath: string, display: string) => {
      // Just return the display text without link, since PDF viewing is not supported yet
      return display.trim()
    }
  )

  // [[Title|Display]]
  processed = processed.replace(
    /\[\[([^\]|#]+)\|([^\]]+)\]\]/g,
    (_match, title: string, display: string) => resolve(title, display.trim())
  )
  // [[Title]]
  processed = processed.replace(
    /\[\[([^\]|#]+)\]\]/g,
    (_match, title: string) => resolve(title, title.trim())
  )

  return processed
}

/* ───────────────────────────────────────────────
   TOC extraction
   ─────────────────────────────────────────────── */
export interface TocItem {
  level: number
  text: string
  id: string
}

export function extractToc(content: string): TocItem[] {
  if (!content) return []
  const headings: TocItem[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const rawText = match[2]
      const text = rawText
        .replace(/\*\*|\*|__|_|`|\[.*?\]\(.*?\)/g, '')
        .trim()
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
      headings.push({ level, text, id })
    }
  }

  return headings
}

/* ───────────────────────────────────────────────
   Helper: extract plain text from React nodes
   ─────────────────────────────────────────────── */
function extractText(node: unknown): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (
    node !== null &&
    typeof node === 'object' &&
    'props' in (node as Record<string, unknown>)
  ) {
    const props = (node as { props?: { children?: unknown } }).props
    return extractText(props?.children)
  }
  return ''
}

/* ───────────────────────────────────────────────
   Custom ReactMarkdown components
   ─────────────────────────────────────────────── */
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [code])

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 flex items-center gap-1 rounded px-2 py-1 text-xs font-mono text-white/70 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/20"
      aria-label="Copy code"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function CodeBlock({
  inline,
  className,
  children,
}: {
  inline?: boolean
  className?: string
  children?: React.ReactNode
}) {
  const [html, setHtml] = useState('')
  const match = /language-(\w+)/.exec(className || '')
  const lang = match ? match[1] : 'text'
  const code = String(children).replace(/\n$/, '')

  useEffect(() => {
    if (!inline && code) {
      getHighlighter().then((h) => {
        setHtml(h.codeToHtml(code, { lang, theme: 'warm-garden' }))
      })
    }
  }, [code, lang, inline])

  if (inline) {
    return (
      <code
        className="rounded px-[6px] py-[2px] font-mono text-[0.875em] bg-Mist text-Slate"
        style={{ fontFamily: '"JetBrains Mono", monospace' }}
      >
        {children}
      </code>
    )
  }

  return (
    <div className="relative group my-6 rounded-lg overflow-hidden">
      {lang !== 'text' && (
        <div className="absolute top-0 left-0 z-10 flex items-center gap-2 px-3 py-1.5 rounded-br-md bg-white/8 backdrop-blur-sm">
          <span className="text-[0.6875rem] font-mono font-medium uppercase tracking-[0.06em] text-white/50">
            {lang}
          </span>
        </div>
      )}
      <div
        className="overflow-x-auto"
        style={{
          background: '#1E1C1A',
          borderRadius: '8px',
          padding: '20px 24px',
          paddingTop: lang !== 'text' ? '36px' : '20px',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <CopyButton code={code} />
    </div>
  )
}

function Callout({
  type,
  title,
  children,
}: {
  type: string
  title: string
  children: React.ReactNode
}) {
  const iconMap: Record<string, React.ReactNode> = {
    note: <Info size={16} className="text-Sage shrink-0" />,
    tip: <Lightbulb size={16} className="text-Gold shrink-0" />,
    warning: <AlertTriangle size={16} className="text-Rose shrink-0" />,
    danger: <AlertTriangle size={16} className="text-Rose shrink-0" />,
    info: <Info size={16} className="text-Sage shrink-0" />,
    success: <Info size={16} className="text-Sage shrink-0" />,
    pdf: <Info size={16} className="text-Amber shrink-0" />,
  }

  const bgMap: Record<string, string> = {
    note: 'rgba(var(--color-sage), 0.12)',
    tip: 'rgba(var(--color-gold), 0.12)',
    warning: 'rgba(var(--color-rose), 0.12)',
    danger: 'rgba(var(--color-rose), 0.12)',
    info: 'rgba(var(--color-sage), 0.12)',
    success: 'rgba(var(--color-sage), 0.12)',
    pdf: 'rgba(var(--color-amber), 0.12)',
  }

  const borderMap: Record<string, string> = {
    note: '#6B8E6B',
    tip: '#C9A84C',
    warning: '#B8695A',
    danger: '#B8695A',
    info: '#6B8E6B',
    success: '#6B8E6B',
    pdf: '#C4783A',
  }

  const lowerType = type.toLowerCase()

  return (
    <div
      className="my-6 rounded-r-lg py-4 px-6"
      style={{
        background: bgMap[lowerType] || bgMap.note,
        borderLeft: `3px solid ${borderMap[lowerType] || borderMap.note}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-Ink">
        {iconMap[lowerType] || iconMap.note}
        <span>{title}</span>
      </div>
      <div className="text-Ink">{children}</div>
    </div>
  )
}

function Blockquote({ children }: { children: React.ReactNode }) {
  const childArray = Array.isArray(children) ? children : [children]

  // Try to find the child that contains [!NOTE] or any callout type
  let calloutChildIndex = -1
  let calloutType = ''
  let calloutTitle = ''

  for (let i = 0; i < childArray.length; i++) {
    const text = extractText(childArray[i])
    // Match any [!TYPE] or [!TYPE|modifier] format (modifier can be empty)
    const match = text.match(/^\[!(\w+)(?:\|[^\]]*)?\]\s*([^\n]*)/)

    if (match) {
      calloutChildIndex = i
      calloutType = match[1]
      let rawTitle = match[2].trim()

      // Process PDF links in title: [[file.pdf#page=...|Display]] -> Display
      rawTitle = rawTitle.replace(/\[\[([^|\]]+\.pdf[^|\]]*)\|([^\]]+)\]\]/g, (_m, _path, display) => display.trim())

      calloutTitle = rawTitle || match[1].charAt(0).toUpperCase() + match[1].slice(1)
      break
    }
  }

  if (calloutChildIndex >= 0) {
    // Found a callout, now we need to remove the [!TYPE] text from the first child
    const calloutChild = childArray[calloutChildIndex]

    // Clone the child and remove the [!NOTE] text from its children
    let modifiedChild = calloutChild
    if (
      calloutChild &&
      typeof calloutChild === 'object' &&
      'props' in calloutChild &&
      calloutChild.props &&
      'children' in calloutChild.props
    ) {
      const childProps = calloutChild.props as { children?: React.ReactNode }
      const grandChildren = Array.isArray(childProps.children)
        ? childProps.children
        : [childProps.children]

      // Remove the first text node that contains [!TYPE] or [!TYPE|modifier]
      const filteredGrandChildren = grandChildren.filter((gc, idx) => {
        if (idx === 0 && typeof gc === 'string' && gc.match(/^\[!\w+(?:\|[^\]]*)?\]/)) {
          return false
        }
        return true
      })

      // Clone the element with filtered children
      modifiedChild = {
        ...calloutChild,
        props: {
          ...childProps,
          children: filteredGrandChildren
        }
      }
    }

    // Get remaining children after the callout child
    const remainingChildren = childArray.slice(calloutChildIndex + 1)

    return (
      <Callout type={calloutType} title={calloutTitle}>
        {modifiedChild}
        {remainingChildren.length > 0 ? remainingChildren : null}
      </Callout>
    )
  }

  return (
    <blockquote className="border-l-[3px] border-Amber pl-6 my-6 italic text-Slate bg-Amber/[0.05] py-4 pr-4 rounded-r-lg">
      {children}
    </blockquote>
  )
}

function buildComponents(
  existingSlugs: string[],
  onWikilinkClick?: (slug: string) => void
): Components {
  return {
    h1: ({ children, id }) => {
      const { collapsedHeadings, toggleHeading } = useContext(HeadingCollapseContext)
      const isCollapsed = id ? collapsedHeadings.has(id) : false

      return (
        <h1
          id={id}
          className="font-display text-[clamp(2rem,3vw,2.75rem)] font-bold leading-[1.1] text-Ink mt-[2em] mb-[1em] scroll-mt-[80px] group flex items-center gap-2 cursor-pointer"
          onClick={() => id && toggleHeading(id)}
        >
          <ChevronRight
            size={22}
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
        </h1>
      )
    },
    h2: ({ children, id }) => {
      const { collapsedHeadings, toggleHeading } = useContext(HeadingCollapseContext)
      const isCollapsed = id ? collapsedHeadings.has(id) : false

      return (
        <h2
          id={id}
          className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-medium leading-[1.2] text-Ink mt-[2.5em] mb-[0.8em] scroll-mt-[80px] group flex items-center gap-2 cursor-pointer"
          onClick={() => id && toggleHeading(id)}
        >
          <ChevronRight
            size={20}
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
        </h2>
      )
    },
    h3: ({ children, id }) => {
      const { collapsedHeadings, toggleHeading } = useContext(HeadingCollapseContext)
      const isCollapsed = id ? collapsedHeadings.has(id) : false

      return (
        <h3
          id={id}
          className="font-display text-[1.25rem] font-semibold leading-[1.3] text-Ink mt-[2em] mb-[0.6em] scroll-mt-[80px] group flex items-center gap-2 cursor-pointer"
          onClick={() => id && toggleHeading(id)}
        >
          <ChevronRight
            size={18}
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
        </h3>
      )
    },
    h4: ({ children, id }) => {
      const { collapsedHeadings, toggleHeading } = useContext(HeadingCollapseContext)
      const isCollapsed = id ? collapsedHeadings.has(id) : false

      return (
        <h4
          id={id}
          className="font-body text-[1rem] font-semibold leading-[1.4] tracking-[0.01em] text-Ink mt-[1.5em] mb-[0.5em] scroll-mt-[80px] group flex items-center gap-2 cursor-pointer"
          onClick={() => id && toggleHeading(id)}
        >
          <ChevronRight
            size={16}
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
        </h4>
      )
    },

    p: ({ children }) => (
      <p className="text-[1.0625rem] leading-[1.75] text-Ink mb-[1.25em]">
        {children}
      </p>
    ),

    a: ({ href, children }) => {
      // Handle anchor links (internal heading links)
      if (href?.startsWith('#')) {
        return (
          <a
            href={href}
            onClick={(e) => {
              e.preventDefault()
              const id = href.slice(1)
              const element = document.getElementById(id)
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                // Update URL hash without jumping
                window.history.pushState(null, '', href)
              }
            }}
            className="text-Amber border-b border-Amber/30 hover:border-Amber hover:bg-Amber/5 transition-colors duration-200 cursor-pointer"
          >
            {children}
          </a>
        )
      }

      // Handle obsidian internal links
      if (href?.startsWith('obsidian-internal://')) {
        const slug = href.replace('obsidian-internal://', '')
        return (
          <span
            onClick={(e) => {
              e.preventDefault()
              if (onWikilinkClick) {
                onWikilinkClick(slug)
              }
            }}
            className="obsidian-wikilink"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                if (onWikilinkClick) {
                  onWikilinkClick(slug)
                }
              }
            }}
          >
            {children}
          </span>
        )
      }

      // Handle .md file links (Obsidian standard markdown links)
      if (href?.endsWith('.md')) {
        const slug = href.replace('.md', '')
        if (onWikilinkClick) {
          return (
            <span
              onClick={(e) => {
                e.preventDefault()
                onWikilinkClick(slug)
              }}
              className="obsidian-wikilink"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onWikilinkClick(slug)
                }
              }}
            >
              {children}
            </span>
          )
        }
        return (
          <Link
            to={`/obsidian?note=${slug}`}
            className="text-Amber border-b border-Amber/30 hover:border-Amber hover:bg-Amber/5 transition-colors duration-200"
          >
            {children}
          </Link>
        )
      }

      // Handle internal note links without .md extension (e.g., [Slutsky定理](Slutsky定理))
      // Check if it's a relative link (no protocol) and matches an existing note
      if (href && !href.includes('://') && !href.startsWith('/') && !href.startsWith('#')) {
        // Decode URL-encoded href (e.g., Slutsky%E5%AE%9A%E7%90%86 -> Slutsky定理)
        const decodedHref = decodeURIComponent(href)
        if (onWikilinkClick && existingSlugs.includes(decodedHref)) {
          return (
            <span
              onClick={(e) => {
                e.preventDefault()
                onWikilinkClick(decodedHref)
              }}
              className="obsidian-wikilink"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onWikilinkClick(decodedHref)
                }
              }}
            >
              {children}
            </span>
          )
        }
      }

      if (href?.startsWith('/blog/') || href?.startsWith('/obsidian')) {
        return (
          <Link
            to={href}
            className="text-Amber border-b border-Amber/30 hover:border-Amber hover:bg-Amber/5 transition-colors duration-200"
          >
            {children}
          </Link>
        )
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-Amber border-b border-Amber/30 hover:border-Amber hover:bg-Amber/5 transition-colors duration-200"
        >
          {children}
        </a>
      )
    },

    code: CodeBlock as unknown as Components['code'],
    pre: ({ children }) => <>{children}</>,

    blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,

    ul: ({ children }) => (
      <ul className="list-disc pl-6 my-4 marker:text-Amber">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 my-4 marker:text-Ink">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="mb-2 text-[1.0625rem] leading-[1.75] text-Ink">
        {children}
      </li>
    ),

    table: ({ children }) => (
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse border border-Sand">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-Linen font-semibold">{children}</thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr className="even:bg-Mist/30">{children}</tr>,
    th: ({ children }) => (
      <th className="border border-Sand px-[14px] py-[10px] text-left text-Ink text-[0.9375rem]">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-Sand px-[14px] py-[10px] text-Ink text-[0.9375rem]">
        {children}
      </td>
    ),

    hr: () => (
      <div className="relative my-8 flex items-center justify-center">
        <hr className="w-full border-t border-Sand" />
        <div className="absolute bg-Parchment px-2">
          <div className="w-2 h-2 rotate-45 bg-Amber" />
        </div>
      </div>
    ),

    img: ({ src, alt }) => {
      // data: URLs are always images, skip extension check
      if (src?.startsWith('data:')) {
        return (
          <img
            src={src}
            alt={alt || ''}
            className="rounded-lg shadow-soft w-full"
            loading="lazy"
          />
        )
      }
      const ext = src?.split('.').pop()?.toLowerCase() || ''
      const audioExts = ['mp3', 'wav', 'm4a', 'ogg', 'webm', 'aac', 'flac']
      const videoExts = ['mp4', 'mov', 'webm', 'mkv']

      if (audioExts.includes(ext)) {
        return (
          <figure className="my-6">
            <audio
              controls
              className="w-full rounded-lg"
              preload="metadata"
            >
              <source src={src} type={`audio/${ext === 'm4a' ? 'mp4' : ext}`} />
            </audio>
            {alt && (
              <figcaption className="text-center mt-2 font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Slate">
                {alt}
              </figcaption>
            )}
          </figure>
        )
      }

      if (videoExts.includes(ext)) {
        return (
          <figure className="my-6">
            <video
              controls
              className="w-full rounded-lg shadow-soft"
              preload="metadata"
            >
              <source src={src} />
            </video>
            {alt && (
              <figcaption className="text-center mt-2 font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Slate">
                {alt}
              </figcaption>
            )}
          </figure>
        )
      }

      return (
        <figure className="my-6">
          <img
            src={src}
            alt={alt || ''}
            className="rounded-lg shadow-soft w-full"
            loading="lazy"
          />
          {alt && (
            <figcaption className="text-center mt-2 font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Slate">
              {alt}
            </figcaption>
          )}
        </figure>
      )
    },
  }
}

/* ───────────────────────────────────────────────
   Main MarkdownRenderer component
   ─────────────────────────────────────────────── */
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

    // When content changes, auto-collapse all headings by default
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

      // Find all siblings until next heading of same or higher level
      let sibling = heading.nextElementSibling
      while (sibling) {
        const siblingTag = sibling.tagName.toLowerCase()

        // Stop if we hit a heading of same or higher level
        if (siblingTag.match(/^h[1-6]$/)) {
          const siblingLevel = parseInt(siblingTag.substring(1))
          if (siblingLevel <= headingLevel) {
            break
          }
        }

        // Toggle visibility
        if (isCollapsed) {
          (sibling as HTMLElement).style.display = 'none'
        } else {
          (sibling as HTMLElement).style.display = ''
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
