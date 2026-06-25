import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { useRef } from 'react'
import { useClickOutside } from './useClickOutside'

function TestComponent({ handler }: { handler: () => void }) {
  const ref = useClickOutside<HTMLDivElement>(handler)
  return <div ref={ref} data-testid="target">Target</div>
}

describe('useClickOutside', () => {
  it('should call handler when clicking outside', () => {
    const handler = vi.fn()
    render(<TestComponent handler={handler} />)

    fireEvent.mouseDown(document.body)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should not call handler when clicking inside', () => {
    const handler = vi.fn()
    const { getByTestId } = render(<TestComponent handler={handler} />)

    fireEvent.mouseDown(getByTestId('target'))
    expect(handler).not.toHaveBeenCalled()
  })

  it('should cleanup listener on unmount', () => {
    const handler = vi.fn()
    const { unmount } = render(<TestComponent handler={handler} />)
    unmount()

    fireEvent.mouseDown(document.body)
    expect(handler).not.toHaveBeenCalled()
  })
})
