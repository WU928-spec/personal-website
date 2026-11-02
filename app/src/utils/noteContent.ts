import type { NoteMeta } from '@/types'

function pathHash(path: string): string {
  let hash = 0x811c9dc5
  for (let index = 0; index < path.length; index++) {
    hash ^= path.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36).padStart(6, '0')
}

export function slugifyNotePath(path: string): string {
  const slug = path
    .replace(/\.md$/i, '')
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9一-龥\-_]/g, '')
    .substring(0, 80)
  return slug || '笔记'
}

export function ensureUniqueNoteSlugs(notes: NoteMeta[]): NoteMeta[] {
  const counts = new Map<string, number>()
  for (const note of notes) counts.set(note.slug, (counts.get(note.slug) || 0) + 1)

  return notes.map((note) => ({
    ...note,
    legacySlug: note.slug,
    slug: (counts.get(note.slug) || 0) > 1 ? `${note.slug}--${pathHash(note.filePath)}` : note.slug,
  }))
}

export function selectVisibleNotes(notes: NoteMeta[]): NoteMeta[] {
  return notes
    .filter((note) => !note.filePath.endsWith('__folder__') && note.slug.trim().length > 0)
    .map((note) => ({
      ...note,
      title: note.title.trim() || '未命名笔记',
      date: note.date && Number.isFinite(Date.parse(note.date)) ? note.date : '',
    }))
}

export function createNoteExcerpt(content: string, maxLength = 120): string {
  const text = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$\n]+\$/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^[>#+\-*\s]+/gm, '')
    .replace(/[*_`~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text
}

export function selectLatestNotes(notes: NoteMeta[], limit = 3): NoteMeta[] {
  return selectVisibleNotes(notes)
    .filter((note) => Number.isFinite(Date.parse(note.modified)))
    .sort((a, b) => Date.parse(b.modified) - Date.parse(a.modified))
    .slice(0, limit)
}
