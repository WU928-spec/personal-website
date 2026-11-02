import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'
import { AuthProvider } from '@/contexts/AuthContext'
import { PreferencesProvider } from '@/contexts/PreferencesContext'

class IntersectionObserverMock {
  observe() {}
  disconnect() {}
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

it('renders the complete home page composition', async () => {
  render(
    <HelmetProvider>
      <PreferencesProvider>
        <AuthProvider>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </AuthProvider>
      </PreferencesProvider>
    </HelmetProvider>,
  )

  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  expect(await screen.findByText('最近的生活')).toBeInTheDocument()
  expect(screen.getByText('最近写的东西')).toBeInTheDocument()
  expect(screen.getByText('我做过的小东西')).toBeInTheDocument()
})
