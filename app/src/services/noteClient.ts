import { supabase, isSupabaseReady } from '@/lib/supabase'
import type { Note, NoteMeta } from '@/types'
import { createNoteExcerpt, ensureUniqueNoteSlugs, slugifyNotePath } from '@/utils/noteContent'

const TABLE = 'notes'
const REQUEST_TIMEOUT = 5000

async function withTimeout<T>(request: PromiseLike<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      Promise.resolve(request),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('笔记请求超时')), REQUEST_TIMEOUT)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function basename(path: string): string {
  return path.split('/').pop() || path
}

function dirname(path: string): string {
  const index = path.lastIndexOf('/')
  return index > 0 ? path.slice(0, index) : ''
}

function extractTags(content: string): string[] {
  const matches = content.match(/#[\w\u4e00-\u9fa5]+/g) || []
  return [...new Set(matches.map((tag) => tag.slice(1)))]
}

function rowToMeta(row: Record<string, unknown>): NoteMeta {
  const filePath = String(row.path)
  const content = String(row.content || '')
  const modified = String(row.updated_at || row.created_at || '')
  const createdAt = String(row.created_at || '')

  return {
    slug: slugifyNotePath(filePath),
    legacySlug: slugifyNotePath(filePath),
    title: basename(filePath).replace(/\.md$/i, '').trim() || '未命名笔记',
    date: createdAt && Number.isFinite(Date.parse(createdAt)) ? createdAt.slice(0, 10) : '',
    category: dirname(filePath) || '笔记',
    tags: extractTags(content),
    excerpt: createNoteExcerpt(content),
    modified,
    filePath,
  }
}

export async function fetchNotes(): Promise<NoteMeta[]> {
  if (!isSupabaseReady()) return []
  try {
    const { data, error } = await withTimeout(supabase!
      .from(TABLE)
      .select('path,content,created_at,updated_at'))
    if (error || !data) return []
    return ensureUniqueNoteSlugs((data as Record<string, unknown>[]).map(rowToMeta))
  } catch {
    return []
  }
}

export async function fetchNote(slug: string): Promise<Note | null> {
  const notes = await fetchNotes()
  const meta = notes.find((note) => note.slug === slug || note.legacySlug === slug)
  if (!meta || !isSupabaseReady()) return null

  try {
    const { data, error } = await withTimeout(supabase!
      .from(TABLE)
      .select('content')
      .eq('path', meta.filePath)
      .maybeSingle())
    if (error || !data) return null
    return { ...meta, content: String((data as Record<string, unknown>).content || ''), frontmatter: {} }
  } catch {
    return null
  }
}

export async function saveNote(path: string, content: string): Promise<boolean> {
  if (!isSupabaseReady()) return false
  try {
    const { error } = await withTimeout(supabase!.from(TABLE).upsert(
      { path, content, updated_at: new Date().toISOString() },
      { onConflict: 'path' },
    ))
    return !error
  } catch {
    return false
  }
}

export async function deleteNote(path: string): Promise<boolean> {
  if (!isSupabaseReady()) return false
  try {
    const { error } = await withTimeout(supabase!.from(TABLE).delete().eq('path', path))
    return !error
  } catch {
    return false
  }
}

export async function renameNote(oldPath: string, newPath: string, content: string): Promise<boolean> {
  if (oldPath === newPath) return saveNote(newPath, content)
  if (!isSupabaseReady()) return false

  try {
    const { data: target } = await withTimeout(supabase!.from(TABLE).select('path').eq('path', newPath).maybeSingle())
    if (target) return false

    const { data: source } = await withTimeout(supabase!.from(TABLE).select('content,created_at').eq('path', oldPath).maybeSingle())
    if (!source) return false

    const sourceRow = source as Record<string, unknown>
    const { error: insertError } = await withTimeout(supabase!.from(TABLE).insert({
      path: newPath,
      content,
      created_at: String(sourceRow.created_at || new Date().toISOString()),
      updated_at: new Date().toISOString(),
    }))
    if (insertError) return false

    const { error: deleteError } = await withTimeout(supabase!.from(TABLE).delete().eq('path', oldPath))
    if (!deleteError) return true

    await withTimeout(supabase!.from(TABLE).delete().eq('path', newPath)).catch(() => {})
    return false
  } catch {
    return false
  }
}
