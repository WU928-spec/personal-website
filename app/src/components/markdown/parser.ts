import matter from 'gray-matter'

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

  let processed = content.replace(/\$\$\$\$/g, '$$\n\n$$')

  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, inner: string) => {
    if (/\\[a-zA-Z]+/.test(inner)) {
      return match
    }
    return inner.trim()
  })

  const resolve = (title: string, display: string): string => {
    const slug = slugifyWikilink(title.trim())
    const safeDisplay = display.trim()

    if (existingSlugs.includes(slug)) {
      if (onWikilinkClick) {
        return `[${safeDisplay}](obsidian-internal://${slug})`
      }
      return `[${safeDisplay}](/obsidian?note=${slug})`
    }
    return `<span class="obsidian-wikilink-unresolved" title="Note not yet published">${safeDisplay}</span>`
  }

  // [[#Heading]] - internal anchor links
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

  // PDF annotations
  processed = processed.replace(
    /\[\[([^\]|]+\.pdf[^\]|]*)\|([^\]]+)\]\]/g,
    (_match, _pdfPath: string, display: string) => display.trim()
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
