import { supabase, isSupabaseReady } from '@/lib/supabase'
import type { ObsidianNoteMeta, ObsidianNote, VaultFile, InboundLinkIndex } from '@/types'

const TABLE = 'notes'

/* ───────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────── */
function slugifyPath(path: string): string {
  return path
    .replace(/\.md$/i, '')
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9一-龥\-_]/g, '')
    .substring(0, 80)
}

function basename(path: string): string {
  return path.split('/').pop() || path
}

function dirname(path: string): string {
  const idx = path.lastIndexOf('/')
  return idx > 0 ? path.slice(0, idx) : ''
}

function extractExcerpt(content: string): string {
  return content.replace(/[#*`_\[\]!]/g, '').slice(0, 120)
}

function extractTags(content: string): string[] {
  const tags = new Set<string>()
  const matches = content.match(/#[\w\u4e00-\u9fa5]+/g)
  if (matches) {
    matches.forEach((m) => tags.add(m.slice(1)))
  }
  return Array.from(tags)
}

/* ───────────────────────────────────────────────
   Build tree from flat path list
   ─────────────────────────────────────────────── */
export function buildTree(paths: string[]): VaultFile[] {
  const root: VaultFile[] = []
  const folderMap = new Map<string, VaultFile>()

  // Ensure all parent folders exist (including __folder__ placeholders)
  paths.forEach((path) => {
    const parts = path.split('/')
    let currentPath = ''
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i]
      if (!folderMap.has(currentPath)) {
        const folder: VaultFile = {
          name: parts[i],
          path: currentPath,
          type: 'folder',
          children: [],
        }
        folderMap.set(currentPath, folder)
      }
    }
  })

  // Link folders to parents
  folderMap.forEach((folder) => {
    const parentDir = dirname(folder.path)
    if (parentDir) {
      const parent = folderMap.get(parentDir)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(folder)
      }
    } else {
      root.push(folder)
    }
  })

  // Add files
  paths.forEach((path) => {
    if (path.endsWith('/__folder__')) return
    const parentDir = dirname(path)
    const file: VaultFile = {
      name: basename(path).replace(/\.md$/i, ''),
      path,
      type: 'file',
    }
    if (parentDir) {
      const parent = folderMap.get(parentDir)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(file)
      }
    } else {
      root.push(file)
    }
  })

  return root
}

/* ───────────────────────────────────────────────
   Row → Meta
   ─────────────────────────────────────────────── */
function rowToMeta(row: Record<string, unknown>): ObsidianNoteMeta {
  const path = String(row.path)
  const content = String(row.content || '')
  const title = basename(path).replace(/\.md$/i, '')
  const folder = dirname(path)
  return {
    slug: slugifyPath(path),
    title,
    date: row.created_at ? String(row.created_at).slice(0, 10) : '',
    category: folder || '笔记',
    tags: extractTags(content),
    excerpt: extractExcerpt(content),
    modified: String(row.updated_at || row.created_at || ''),
    outboundLinks: [],
    filePath: path,
  }
}

/* ───────────────────────────────────────────────
   Read
   ─────────────────────────────────────────────── */
export async function fetchObsidianNotes(): Promise<ObsidianNoteMeta[]> {
  if (!isSupabaseReady()) return []
  const { data, error } = await supabase.from(TABLE).select('path,content,created_at,updated_at')
  if (error) {
    console.warn('Failed to fetch notes:', error.message)
    return []
  }
  return (data || []).map((r) => rowToMeta(r as Record<string, unknown>))
}

export async function fetchObsidianNote(slug: string): Promise<ObsidianNote | null> {
  const all = await fetchObsidianNotes()
  const meta = all.find((n) => n.slug === slug)
  if (!meta) return null

  if (!isSupabaseReady()) return null
  const { data, error } = await supabase
    .from(TABLE)
    .select('content')
    .eq('path', meta.filePath)
    .maybeSingle()

  if (error || !data) return null

  return {
    ...meta,
    content: String(data.content || ''),
    frontmatter: {},
  }
}

export async function fetchVaultTree(): Promise<VaultFile[]> {
  if (!isSupabaseReady()) return []
  const { data, error } = await supabase.from(TABLE).select('path')
  if (error) {
    console.warn('Failed to fetch paths:', error.message)
    return []
  }
  const paths = (data || []).map((r) => String((r as Record<string, unknown>).path))
  return buildTree(paths)
}

export async function fetchInboundLinks(): Promise<InboundLinkIndex> {
  return {}
}

export async function isObsidianServerAvailable(): Promise<boolean> {
  const notes = await fetchObsidianNotes()
  return notes.length > 0
}

/* ───────────────────────────────────────────────
   Write (login required — guarded by UI)
   ─────────────────────────────────────────────── */
export async function saveNoteToSupabase(path: string, content: string): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await supabase.from(TABLE).upsert(
    {
      path,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'path' }
  )
  if (error) {
    console.warn('Failed to save note:', error.message)
    return false
  }
  return true
}

export async function deleteNoteFromSupabase(path: string): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await supabase.from(TABLE).delete().eq('path', path)
  if (error) {
    console.warn('Failed to delete note:', error.message)
    return false
  }
  return true
}

export async function deleteFolderFromSupabase(folderPath: string): Promise<boolean> {
  if (!isSupabaseReady()) return false
  // Delete all notes whose path starts with folderPath/
  const prefix = folderPath.endsWith('/') ? folderPath : `${folderPath}/`
  const { error } = await supabase.from(TABLE).delete().like('path', `${prefix}%`)
  if (error) {
    console.warn('Failed to delete folder:', error.message)
    return false
  }
  return true
}

export async function renameNoteInSupabase(oldPath: string, newPath: string): Promise<boolean> {
  if (!isSupabaseReady()) return false
  // Delete old, insert new (since path is PK)
  const { data } = await supabase.from(TABLE).select('content').eq('path', oldPath).maybeSingle()
  if (!data) return false

  await supabase.from(TABLE).delete().eq('path', oldPath)
  const { error } = await supabase.from(TABLE).insert({
    path: newPath,
    content: String(data.content || ''),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  if (error) {
    console.warn('Failed to rename note:', error.message)
    return false
  }
  return true
}

/* ───────────────────────────────────────────────
   Legacy no-ops (kept for compatibility)
   ─────────────────────────────────────────────── */
export async function saveObsidianNote(_slug: string, _content: string): Promise<boolean> {
  console.warn('Use saveNoteToSupabase instead.')
  return false
}

export async function deployNotes(_slugs: string[]): Promise<{ status: string }> {
  return { status: 'noop' }
}
