import { createNoteExcerpt, ensureUniqueNoteSlugs, selectLatestNotes, selectVisibleNotes, slugifyNotePath } from './noteContent'
import type { NoteMeta } from '@/types'

const meta = (filePath: string, modified: string): NoteMeta => ({
  slug: slugifyNotePath(filePath),
  title: filePath.replace(/\.md$/, ''),
  date: modified.slice(0, 10),
  category: '笔记',
  tags: [],
  excerpt: '',
  modified,
  filePath,
})

describe('note content', () => {
  it('preserves Chinese paths in slugs', () => {
    expect(slugifyNotePath('生活/春日 记录.md')).toBe('生活-春日-记录')
  })

  it('removes markdown, code and formula source from excerpts', () => {
    const source = '# 标题\n\n```ts\nconst secret = true\n```\n\n**你好** $x^2$\n\n$$\\frac{1}{2}$$'
    expect(createNoteExcerpt(source)).toBe('标题 你好')
  })

  it('sorts valid dates, filters placeholders and invalid rows, and applies the limit', () => {
    const rows = [
      meta('old.md', '2025-01-01T00:00:00Z'),
      meta('folder/__folder__', '2026-01-01T00:00:00Z'),
      meta('bad.md', 'not-a-date'),
      meta('new.md', '2026-01-01T00:00:00Z'),
    ]
    expect(selectLatestNotes(rows, 1).map((note) => note.title)).toEqual(['new'])
  })

  it('falls back to a neutral title when a filename is blank', () => {
    expect(selectLatestNotes([meta('.md', '2026-01-01T00:00:00Z')], 3)[0].title).toBe('未命名笔记')
  })

  it('creates non-empty unique slugs for punctuation, emoji and normalization collisions', () => {
    const rows = ensureUniqueNoteSlugs([
      meta('a b.md', '2026-01-01T00:00:00Z'),
      meta('a-b.md', '2026-01-01T00:00:00Z'),
      meta('💡.md', '2026-01-01T00:00:00Z'),
      meta('.md', '2026-01-01T00:00:00Z'),
    ])
    expect(new Set(rows.map((note) => note.slug)).size).toBe(4)
    expect(rows.every((note) => note.slug.length > 0)).toBe(true)
    expect(rows.map((note) => note.legacySlug)).toEqual(['a-b', 'a-b', '笔记', '笔记'])
  })

  it('normalizes blank titles and invalid display dates in every visible list', () => {
    const [row] = selectVisibleNotes([{ ...meta('blank.md', '2026-01-01T00:00:00Z'), title: '   ', date: 'bad-date' }])
    expect(row.title).toBe('未命名笔记')
    expect(row.date).toBe('')
  })
})
