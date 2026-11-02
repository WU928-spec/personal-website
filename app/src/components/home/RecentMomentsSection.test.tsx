import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecentMomentsSection from './RecentMomentsSection'
import { useMoments } from '@/hooks/useMoments'
import { PreferencesProvider } from '@/contexts/PreferencesContext'

vi.mock('@/hooks/useMoments', () => ({ useMoments: vi.fn() }))
const mocked = vi.mocked(useMoments)

function renderSection() {
  return render(<MemoryRouter><PreferencesProvider><RecentMomentsSection /></PreferencesProvider></MemoryRouter>)
}

beforeEach(() => {
  mocked.mockReturnValue({ moments: [], loading: false } as ReturnType<typeof useMoments>)
  vi.mocked(localStorage.getItem).mockReturnValue(null)
})

it('keeps a quiet empty state when moments are unavailable', () => {
  renderSection()
  expect(screen.getByText('最近的生活')).toBeInTheDocument()
  expect(screen.getByText('新的故事正在酝酿。')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '查看全部动态' })).toHaveAttribute('href', '/moments')
})

it('translates the section when English is selected', () => {
  vi.mocked(localStorage.getItem).mockImplementation((key) =>
    key === 'vibecoding_preferences' ? JSON.stringify({ theme: 'light', lang: 'en' }) : null,
  )
  renderSection()
  expect(screen.getByText('Recent moments')).toBeInTheDocument()
  expect(screen.getByText('New stories are on the way.')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'View all moments' })).toHaveAttribute('href', '/moments')
})
