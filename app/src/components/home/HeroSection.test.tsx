import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import HeroSection from './HeroSection'
import { PreferencesProvider } from '@/contexts/PreferencesContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { fetchNotes } from '@/services/noteClient'
import type { NoteMeta } from '@/types'

vi.mock('@/services/noteClient', () => ({ fetchNotes: vi.fn() }))
const mocked = vi.mocked(fetchNotes)
const note: NoteMeta = {
  slug: '春日',
  title: '春日记录',
  date: '2026-01-01',
  category: '生活',
  tags: [],
  excerpt: '一些真实的日常。',
  modified: '2026-01-01T00:00:00Z',
  filePath: '春日.md',
}

function renderHero() {
  return render(
    <HelmetProvider>
      <PreferencesProvider>
        <AuthProvider>
          <MemoryRouter>
            <HeroSection />
          </MemoryRouter>
        </AuthProvider>
      </PreferencesProvider>
    </HelmetProvider>,
  )
}

it('links the latest real note directly from the welcome section', async () => {
  mocked.mockResolvedValue([note])
  renderHero()
  const link = await screen.findByRole('link', { name: /春日记录/ })
  expect(link).toHaveAttribute('href', '/notes?note=%E6%98%A5%E6%97%A5')
})

it('keeps a useful notes link when no notes are available', async () => {
  mocked.mockResolvedValue([])
  renderHero()
  expect(await screen.findByRole('link', { name: /去读笔记|Read my notes/ })).toHaveAttribute('href', '/notes')
})
