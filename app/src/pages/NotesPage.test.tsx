import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import NotesPage from './NotesPage'
import { PreferencesProvider } from '@/contexts/PreferencesContext'
import { useNotes } from '@/hooks/useNotes'
import { renameNote } from '@/services/noteClient'
import type { Note } from '@/types'

vi.mock('@/hooks/useNotes', () => ({ useNotes: vi.fn() }))
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ isLoggedIn: true }) }))
vi.mock('@/services/noteClient', () => ({ renameNote: vi.fn() }))

const note: Note = {
  slug: 'old', title: '旧笔记', date: '2026-01-01', category: '生活', tags: [], excerpt: '',
  modified: '2026-01-01T00:00:00Z', filePath: 'old.md', content: '旧内容', frontmatter: {},
}

it('creates a new note after returning to the list instead of renaming the last-read note', async () => {
  const save = vi.fn().mockResolvedValue(true)
  const refresh = vi.fn().mockResolvedValue([])
  vi.mocked(useNotes).mockReturnValue({
    notes: [note], loading: false, selectedNote: note, error: '', selectNote: vi.fn(), refresh,
    save, remove: vi.fn(),
  } as ReturnType<typeof useNotes>)

  render(<HelmetProvider><PreferencesProvider><MemoryRouter initialEntries={['/notes?note=old']}><NotesPage /></MemoryRouter></PreferencesProvider></HelmetProvider>)

  fireEvent.click(await screen.findByRole('button', { name: '全部笔记' }))
  fireEvent.click(await screen.findByRole('button', { name: '写笔记' }))
  fireEvent.change(screen.getByLabelText('文件名'), { target: { value: 'new.md' } })
  fireEvent.change(screen.getByLabelText('Markdown 与 LaTeX'), { target: { value: '新内容' } })
  fireEvent.click(screen.getByRole('button', { name: '保存笔记' }))

  await waitFor(() => expect(save).toHaveBeenCalledWith('new.md', '新内容'))
  expect(renameNote).not.toHaveBeenCalled()
})
