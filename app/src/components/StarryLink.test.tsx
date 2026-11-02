import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StarryLink from './StarryLink'

it('keeps the decorative star keyboard accessible', () => {
  render(
    <MemoryRouter>
      <StarryLink />
    </MemoryRouter>,
  )

  const link = screen.getByRole('link', { name: '进入星空' })
  expect(link).toHaveAttribute('href', '/starry')
  expect(link).toHaveClass('focus-visible:outline-none')
})
