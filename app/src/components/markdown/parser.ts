import matter from 'gray-matter'

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

export interface TocItem {
  level: number
  text: string
  id: string
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{Letter}\p{Number}-]/gu, '')
}

export function preprocessMarkdown(content: string): string {
  return content
}

export function extractToc(content: string): TocItem[] {
  const source = content.replace(/```[\s\S]*?```/g, '')
  const counts = new Map<string, number>()

  return source.split('\n').flatMap((line) => {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (!match) return []
    const text = match[2]
      .replace(/\*\*|\*|__|_|`/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .trim()
    const baseId = slugifyHeading(text)
    const count = counts.get(baseId) ?? 0
    counts.set(baseId, count + 1)
    return [{ level: match[1].length, text, id: count ? `${baseId}-${count}` : baseId }]
  })
}
