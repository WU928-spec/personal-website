import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

export interface NoteMeta {
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

export interface Note extends NoteMeta {
  content: string
  frontmatter: Record<string, unknown>
}

export interface VaultFile {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: VaultFile[]
}

/* ───────────────────────────────────────────────
   Slug utilities
   ─────────────────────────────────────────────── */
function slugify(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\-_]/g, '')
    .substring(0, 60)
}

/* ───────────────────────────────────────────────
   Extract wikilinks from content
   ─────────────────────────────────────────────── */
function extractWikilinks(content: string): string[] {
  const links: string[] = []
  // [[Title|Display]] or [[Title]]
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    links.push(slugify(match[1].trim()))
  }
  return [...new Set(links)]
}

/* ───────────────────────────────────────────────
   Generate excerpt from content (first 200 chars)
   ─────────────────────────────────────────────── */
function generateExcerpt(content: string): string {
  const plain = content
    .replace(/#+\s+/g, '')
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
  return plain.length > 200 ? plain.slice(0, 200) + '…' : plain
}

/* ───────────────────────────────────────────────
   Scan a single markdown file
   ─────────────────────────────────────────────── */
async function scanMarkdownFile(
  filePath: string,
  vaultPath: string
): Promise<NoteMeta | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    const parsed = matter(raw)
    const relativePath = path.relative(vaultPath, filePath)
    const fileName = path.basename(filePath, '.md')

    const title =
      (parsed.data.title as string) ||
      fileName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

    // Use fileName (without .md) as slug for consistency with file tree
    const slug = (parsed.data.slug as string) || slugify(fileName)
    const date = (parsed.data.date as string) || new Date().toISOString().split('T')[0]
    const category = (parsed.data.category as string) || 'Uncategorized'
    const tags = Array.isArray(parsed.data.tags)
      ? parsed.data.tags.map((t) => String(t))
      : []
    const excerpt =
      (parsed.data.excerpt as string) || generateExcerpt(parsed.content)

    const stat = await fs.stat(filePath)
    const modified = stat.mtime.toISOString()

    const outboundLinks = extractWikilinks(parsed.content)

    return {
      slug,
      title,
      date,
      category,
      tags,
      excerpt,
      modified,
      outboundLinks,
      filePath: relativePath,
    }
  } catch {
    return null
  }
}

/* ───────────────────────────────────────────────
   Recursively scan vault directory
   ─────────────────────────────────────────────── */
export async function scanVault(vaultPath: string): Promise<NoteMeta[]> {
  const notes: NoteMeta[] = []

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        // Skip Obsidian system folders
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
        await walk(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const note = await scanMarkdownFile(fullPath, vaultPath)
        if (note) notes.push(note)
      }
    }
  }

  try {
    await walk(vaultPath)
  } catch {
    // vault path doesn't exist or is empty
  }

  return notes
}

/* ───────────────────────────────────────────────
   Build file tree for sidebar
   ─────────────────────────────────────────────── */
export async function buildFileTree(vaultPath: string): Promise<VaultFile[]> {
  const tree: VaultFile[] = []

  async function walk(dir: string, parent: VaultFile[]) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
      const fullPath = path.join(dir, entry.name)
      const relativePath = path.relative(vaultPath, fullPath)

      if (entry.isDirectory()) {
        const folder: VaultFile = {
          name: entry.name,
          path: relativePath,
          type: 'folder',
          children: [],
        }
        parent.push(folder)
        await walk(fullPath, folder.children!)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        parent.push({
          name: entry.name.replace('.md', ''),
          path: relativePath,
          type: 'file',
        })
      }
    }
  }

  try {
    await walk(vaultPath, tree)
  } catch {
    // vault path doesn't exist
  }

  return tree
}

/* ───────────────────────────────────────────────
   Process Obsidian embed syntax ![[filename.ext]]
   ─────────────────────────────────────────────── */
function processEmbeds(content: string, noteFilePath: string, vaultPath: string): string {
  const noteDir = path.dirname(noteFilePath)

  // 1. Handle Obsidian embed syntax ![[filename.ext]]
  let processed = content.replace(/!\[\[([^\]]+)\]\]/g, (_match, filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    const fileRelPath = path.posix.join(noteDir, filename)

    const audioExts = ['mp3', 'wav', 'm4a', 'ogg', 'webm', 'aac', 'flac']
    const videoExts = ['mp4', 'mov', 'webm', 'mkv']
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']

    if (audioExts.includes(ext)) {
      return `<audio controls preload="metadata" style="width:100%;margin:1rem 0;"><source src="http://localhost:2667/api/file/${encodeURIComponent(fileRelPath)}" type="audio/${ext === 'm4a' ? 'mp4' : ext}"></audio>`
    }
    if (videoExts.includes(ext)) {
      return `<video controls preload="metadata" style="width:100%;margin:1rem 0;"><source src="http://localhost:2667/api/file/${encodeURIComponent(fileRelPath)}"></video>`
    }
    if (imageExts.includes(ext)) {
      return `<img src="http://localhost:2667/api/file/${encodeURIComponent(fileRelPath)}" alt="${filename}" style="max-width:100%;border-radius:8px;margin:1rem 0;" />`
    }
    // Fallback: treat as internal note embed (link to note)
    return `[${filename}](/blog/${slugify(filename.replace('.md', ''))})`
  })

  // 2. Collapse excessive blank lines (3+ newlines → 2 newlines)
  // This prevents Obsidian notes with lots of empty lines from rendering as huge gaps
  processed = processed.replace(/\n{3,}/g, '\n\n')

  return processed
}

/* ───────────────────────────────────────────────
   Read a single note by slug
   ─────────────────────────────────────────────── */
export async function getNoteBySlug(
  vaultPath: string,
  slug: string
): Promise<Note | null> {
  const notes = await scanVault(vaultPath)
  const meta = notes.find((n) => n.slug === slug)
  if (!meta) return null

  const fullPath = path.join(vaultPath, meta.filePath)
  try {
    const raw = await fs.readFile(fullPath, 'utf-8')
    const parsed = matter(raw)
    const processedContent = processEmbeds(parsed.content, meta.filePath, vaultPath)
    return {
      ...meta,
      content: processedContent,
      frontmatter: parsed.data,
    }
  } catch {
    return null
  }
}

/* ───────────────────────────────────────────────
   Build inbound link index
   ─────────────────────────────────────────────── */
export function buildInboundLinkIndex(notes: NoteMeta[]): Map<string, string[]> {
  const index = new Map<string, string[]>()

  for (const note of notes) {
    for (const targetSlug of note.outboundLinks) {
      if (!index.has(targetSlug)) {
        index.set(targetSlug, [])
      }
      const list = index.get(targetSlug)!
      if (!list.includes(note.slug)) {
        list.push(note.slug)
      }
    }
  }

  return index
}
