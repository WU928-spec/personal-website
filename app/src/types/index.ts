/* ───────────────────────────────────────────────
   Obsidian Integration Types
   ─────────────────────────────────────────────── */

export interface ObsidianNoteMeta {
  slug: string
  title: string
  date: string
  category: string
  tags: string[]
  excerpt: string
  modified: string
  outboundLinks: string[]
  filePath: string
}

export interface ObsidianNote extends ObsidianNoteMeta {
  content: string
  frontmatter: Record<string, unknown>
}

export interface VaultFile {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: VaultFile[]
}

export interface LinkGraph {
  nodes: { id: string; group: number; title?: string }[]
  links: { source: string; target: string }[]
}

export interface InboundLinkIndex {
  [targetSlug: string]: string[] // array of slugs that link TO target
}
