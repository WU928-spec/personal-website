export interface NoteMeta {
  slug: string
  legacySlug?: string
  title: string
  date: string
  category: string
  tags: string[]
  excerpt: string
  modified: string
  filePath: string
}

export interface Note extends NoteMeta {
  content: string
  frontmatter: Record<string, unknown>
}
