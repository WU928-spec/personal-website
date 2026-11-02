import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

class IntersectionObserverMock {
  observe() {}
  disconnect() {}
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

it('renders the home route inside the application layout', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )

  expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
  expect(await screen.findByText('最近的生活')).toBeInTheDocument()
})
