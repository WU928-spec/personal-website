import { useState, useEffect, useCallback } from 'react'
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
import { Copy, Check, Lightbulb, AlertTriangle, Info } from 'lucide-react'

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
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60)
}

export function preprocessWikilinks(
  content: string,
  existingSlugs: string[]
): string {
  if (!content) return ''
  // [[Title|Display]]
  let processed = content.replace(
    /\[\[([^\]|]+)\|([^\]]+)\]\]/g,
    (_match, title: string, display: string) => {
      const slug = slugifyWikilink(title.trim())
      if (existingSlugs.includes(slug)) {
        return `[${display}](/blog/${slug})`
      }
      return `[${display}](unresolved://${slug})`
    }
  )
  // [[Title]]
  processed = processed.replace(
    /\[\[([^\]|]+)\]\]/g,
    (_match, title: string) => {
      const slug = slugifyWikilink(title.trim())
      if (existingSlugs.includes(slug)) {
        return `[${title}](/blog/${slug})`
      }
      return `[${title}](unresolved://${slug})`
    }
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
  }

  const bgMap: Record<string, string> = {
    note: 'rgba(var(--color-sage), 0.12)',
    tip: 'rgba(var(--color-gold), 0.12)',
    warning: 'rgba(var(--color-rose), 0.12)',
    danger: 'rgba(var(--color-rose), 0.12)',
    info: 'rgba(var(--color-sage), 0.12)',
    success: 'rgba(var(--color-sage), 0.12)',
  }

  const borderMap: Record<string, string> = {
    note: '#6B8E6B',
    tip: '#C9A84C',
    warning: '#B8695A',
    danger: '#B8695A',
    info: '#6B8E6B',
    success: '#6B8E6B',
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

const CALLOUT_TYPES = ['note', 'warning', 'tip', 'info', 'danger', 'success']

function Blockquote({ children }: { children: React.ReactNode }) {
  const childArray = Array.isArray(children) ? children : [children]
  const firstText = extractText(childArray[0])
  const match = firstText.match(/^\[(\w+)\]\s*(.*)/)

  if (match && CALLOUT_TYPES.includes(match[1].toLowerCase())) {
    const [, type, title] = match
    const calloutTitle =
      title.trim() || type.charAt(0).toUpperCase() + type.slice(1)
    const contentChildren = childArray.slice(1)

    return (
      <Callout type={type} title={calloutTitle}>
        {contentChildren.length > 0 ? contentChildren : null}
      </Callout>
    )
  }

  return (
    <blockquote className="border-l-[3px] border-Amber pl-6 my-6 italic text-Slate bg-Amber/[0.05] py-4 pr-4 rounded-r-lg">
      {children}
    </blockquote>
  )
}

function buildComponents(_existingSlugs: string[]): Components {
  return {
    h2: ({ children, id }) => (
      <h2
        id={id}
        className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-medium leading-[1.2] text-Ink mt-[2.5em] mb-[0.8em] scroll-mt-[80px] group"
      >
        {children}
        <a
          href={`#${id}`}
          className="anchor ml-2 text-Amber opacity-0 group-hover:opacity-100 transition-opacity duration-200 no-underline"
          aria-hidden="true"
        >
          ¶
        </a>
      </h2>
    ),
    h3: ({ children, id }) => (
      <h3
        id={id}
        className="font-display text-[1.25rem] font-semibold leading-[1.3] text-Ink mt-[2em] mb-[0.6em] scroll-mt-[80px] group"
      >
        {children}
        <a
          href={`#${id}`}
          className="anchor ml-2 text-Amber opacity-0 group-hover:opacity-100 transition-opacity duration-200 no-underline"
          aria-hidden="true"
        >
          ¶
        </a>
      </h3>
    ),
    h4: ({ children, id }) => (
      <h4
        id={id}
        className="font-body text-[1rem] font-semibold leading-[1.4] tracking-[0.01em] text-Ink mt-[1.5em] mb-[0.5em] scroll-mt-[80px] group"
      >
        {children}
        <a
          href={`#${id}`}
          className="anchor ml-2 text-Amber opacity-0 group-hover:opacity-100 transition-opacity duration-200 no-underline"
          aria-hidden="true"
        >
          ¶
        </a>
      </h4>
    ),

    p: ({ children }) => (
      <p className="text-[1.0625rem] leading-[1.75] text-Ink mb-[1.25em]">
        {children}
      </p>
    ),

    a: ({ href, children }) => {
      if (href?.startsWith('unresolved://')) {
        return (
          <span
            className="text-Amber/50 border-b border-dashed border-Amber/50 cursor-help"
            title="Note not yet published"
          >
            {children}
          </span>
        )
      }
      if (href?.startsWith('/blog/')) {
        return (
          <Link
            to={href}
            className="text-Amber border-b border-Amber/30 hover:border-Amber hover:bg-Amber/5 transition-colors duration-200"
          >
            {children}
          </Link>
        )
      }
      if (href?.startsWith('obsidian://') || href?.startsWith('obsidian-unresolved://')) {
        return (
          <a
            href={href}
            className="text-Amber border-b border-Amber/30 hover:border-Amber hover:bg-Amber/5 transition-colors duration-200"
          >
            {children}
          </a>
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
}

export default function MarkdownRenderer({
  content,
  existingSlugs = [],
  className = '',
}: MarkdownRendererProps) {
  const processedContent = preprocessWikilinks(content, existingSlugs)

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[
          rehypeRaw,
          rehypeKatex,
          rehypeSlug,
        ]}
        components={buildComponents(existingSlugs)}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
