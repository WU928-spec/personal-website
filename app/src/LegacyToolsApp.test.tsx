import { render, screen, waitFor } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import LegacyToolsApp from './LegacyToolsApp'
import { PreferencesProvider } from '@/contexts/PreferencesContext'

function renderAt(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <PreferencesProvider>
          <LegacyToolsApp />
        </PreferencesProvider>
      </MemoryRouter>
    </HelmetProvider>,
  )
}

it('renders the legacy tools index at the static tools route', () => {
  renderAt('/tools')
  expect(screen.getByRole('heading', { name: '实习决策助手' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: '开发工具' })).toBeInTheDocument()
})

it('renders the original text segmenter at its static route', () => {
  renderAt('/tools/text-segmenter')
  expect(screen.getByRole('button', { name: '一键分段' })).toBeInTheDocument()
  expect(screen.getByText('分段规则')).toBeInTheDocument()
})

it('follows the static site theme', async () => {
  document.documentElement.dataset.theme = 'dark'
  const view = renderAt('/tools')
  try {
    await waitFor(() => expect(document.documentElement).toHaveClass('dark'))
  } finally {
    view.unmount()
    delete document.documentElement.dataset.theme
    document.documentElement.classList.remove('dark')
  }
})
