import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NoteArticle from './NoteArticle'
import { PreferencesProvider } from '@/contexts/PreferencesContext'
import type { Note } from '@/types'

const note: Note = {
  slug: '春日',
  title: '春日记录',
  date: '2026-01-01',
  category: '生活',
  tags: ['春天'],
  excerpt: '',
  modified: '2026-01-01T00:00:00Z',
  filePath: '春日.md',
  frontmatter: {},
  content: '## 小标题\n\n正文 $x^2$',
}

function renderArticle(value: Note) {
  return render(
    <PreferencesProvider>
      <MemoryRouter>
        <NoteArticle note={value} />
      </MemoryRouter>
    </PreferencesProvider>,
  )
}

it('renders article metadata, contents and markdown without Obsidian controls', () => {
  const { container } = renderArticle(note)

  expect(screen.getByRole('heading', { level: 1, name: '春日记录' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '小标题' })).toHaveAttribute('href', '#小标题')
  expect(container.querySelector('.katex')).not.toBeNull()
  expect(screen.queryByText(/wikilink|vault|obsidian/i)).not.toBeInTheDocument()
})

it('uses the same punctuation-aware anchor in the TOC and rendered heading', () => {
  renderArticle({ ...note, content: '## 阅读 & 思考\n\n正文' })

  const tocLink = screen.getByRole('link', { name: '阅读 & 思考' })
  const heading = screen.getByRole('heading', { name: '阅读 & 思考' })
  expect(tocLink).toHaveAttribute('href', `#${heading.id}`)
  expect(heading.id).toBe('阅读--思考')
})

it('keeps link labels when generating a TOC anchor', () => {
  renderArticle({ ...note, content: '## 阅读 [某本书](https://example.com) 笔记\n\n正文' })

  const tocLink = screen.getByRole('link', { name: '阅读 某本书 笔记' })
  const heading = screen.getByRole('heading', { name: '阅读 某本书 笔记' })
  expect(tocLink).toHaveAttribute('href', `#${heading.id}`)
  expect(heading.id).toBe('阅读-某本书-笔记')
})
