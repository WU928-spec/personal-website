import { render, waitFor } from '@testing-library/react'
import { PageTransition } from './LazyPage'

it('does not hide content behind an initial animation when reduced motion is requested', async () => {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia

  const { container } = render(<PageTransition><span>正文</span></PageTransition>)
  await waitFor(() => {
    expect((container.firstChild as HTMLElement).style.opacity).not.toBe('0')
  }, { timeout: 100 })
})
