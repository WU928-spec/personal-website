import { useState, useEffect, useCallback, useContext } from 'react'
import type { Components } from 'react-markdown'
import { Link } from 'react-router-dom'
import { Copy, Check, Lightbulb, AlertTriangle, Info, ChevronRight } from 'lucide-react'
import { getHighlighter } from './theme'
import { HeadingCollapseContext } from './heading-context'

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
   CopyButton
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

/* ───────────────────────────────────────────────
   CodeBlock
   ─────────────────────────────────────────────── */
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

/* ───────────────────────────────────────────────
   Callout
   ─────────────────────────────────────────────── */
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

/* ───────────────────────────────────────────────
   Blockquote
   ─────────────────────────────────────────────── */
function Blockquote({ children }: { children: React.ReactNode }) {
  const childArray = Array.isArray(children) ? children : [children]

  let calloutChildIndex = -1
  let calloutType = ''
  let calloutTitle = ''

  for (let i = 0; i < childArray.length; i++) {
    const text = extractText(childArray[i])
    const match = text.match(/^\[!(\w+)(?:\|[^\]]*)?\]\s*([^\n]*)/)

    if (match) {
      calloutChildIndex = i
      calloutType = match[1]
      let rawTitle = match[2].trim()
      rawTitle = rawTitle.replace(/\[\[([^\]|]+\.pdf[^\]|]*)\|([^\]]+)\]\]/g, (_m, _path, display) => display.trim())
      calloutTitle = rawTitle || match[1].charAt(0).toUpperCase() + match[1].slice(1)
      break
    }
  }

  if (calloutChildIndex >= 0) {
    const calloutChild = childArray[calloutChildIndex]
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

      const filteredGrandChildren = grandChildren.filter((gc, idx) => {
        if (idx === 0 && typeof gc === 'string' && gc.match(/^\[!\w+(?:\|[^\]]*)?\]/)) {
          return false
        }
        return true
      })

      modifiedChild = {
        ...calloutChild,
        props: {
          ...childProps,
          children: filteredGrandChildren
        }
      }
    }

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

/* ───────────────────────────────────────────────
   Heading component factory
   ─────────────────────────────────────────────── */
function makeHeading(level: 1 | 2 | 3 | 4) {
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

/* ───────────────────────────────────────────────
   Build all custom ReactMarkdown components
   ─────────────────────────────────────────────── */
export function buildComponents(
  existingSlugs: string[],
  onWikilinkClick?: (slug: string) => void
): Components {
  const handleAnchorClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    const id = href.slice(1)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.pushState(null, '', href)
    }
  }

  const makeWikilinkSpan = (slug: string, children: React.ReactNode) => (
    <span
      onClick={(e) => {
        e.preventDefault()
        onWikilinkClick?.(slug)
      }}
      className="obsidian-wikilink"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onWikilinkClick?.(slug)
        }
      }}
    >
      {children}
    </span>
  )

  return {
    h1: makeHeading(1) as unknown as Components['h1'],
    h2: makeHeading(2) as unknown as Components['h2'],
    h3: makeHeading(3) as unknown as Components['h3'],
    h4: makeHeading(4) as unknown as Components['h4'],

    p: ({ children }) => (
      <p className="text-[1.0625rem] leading-[1.75] text-Ink mb-[1.25em]">{children}</p>
    ),

    a: ({ href, children }) => {
      if (href?.startsWith('#')) {
        return (
          <a
            href={href}
            onClick={(e) => handleAnchorClick(e, href)}
            className="text-Amber border-b border-Amber/30 hover:border-Amber hover:bg-Amber/5 transition-colors duration-200 cursor-pointer"
          >
            {children}
          </a>
        )
      }

      if (href?.startsWith('obsidian-internal://')) {
        const slug = href.replace('obsidian-internal://', '')
        return makeWikilinkSpan(slug, children)
      }

      if (href?.endsWith('.md')) {
        const slug = href.replace('.md', '')
        if (onWikilinkClick) {
          return makeWikilinkSpan(slug, children)
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

      if (href && !href.includes('://') && !href.startsWith('/') && !href.startsWith('#')) {
        const decodedHref = decodeURIComponent(href)
        if (onWikilinkClick && existingSlugs.includes(decodedHref)) {
          return makeWikilinkSpan(decodedHref, children)
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
      <li className="mb-2 text-[1.0625rem] leading-[1.75] text-Ink">{children}</li>
    ),

    table: ({ children }) => (
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse border border-Sand">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-Linen font-semibold">{children}</thead>,
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
            <audio controls className="w-full rounded-lg" preload="metadata">
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
            <video controls className="w-full rounded-lg shadow-soft" preload="metadata">
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
          <img src={src} alt={alt || ''} className="rounded-lg shadow-soft w-full" loading="lazy" />
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
