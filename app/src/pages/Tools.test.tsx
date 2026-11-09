import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import Tools from './Tools'
import { PreferencesProvider } from '@/contexts/PreferencesContext'

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}</output>
}

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
  return { ...actual, useReducedMotion: () => true }
})

it('does not stagger-hide tool cards when reduced motion is requested', async () => {
  render(<MemoryRouter><PreferencesProvider><Tools /></PreferencesProvider></MemoryRouter>)
  const card = screen.getByRole('heading', { name: '实习决策助手' }).closest('.group')?.parentElement as HTMLElement

  await waitFor(() => expect(card.style.opacity).toBe('1'), { timeout: 100 })
})

it('opens tools at the current static site routes', () => {
  render(<MemoryRouter initialEntries={['/tools']}><LocationProbe /><PreferencesProvider><Tools /></PreferencesProvider></MemoryRouter>)
  fireEvent.click(screen.getByRole('heading', { name: '实习决策助手' }))

  expect(screen.getByTestId('location')).toHaveTextContent('/tools/internship')
})
