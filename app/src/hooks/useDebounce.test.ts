import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500))
    expect(result.current).toBe('hello')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } }
    )

    expect(result.current).toBe('hello')

    // 更新值
    rerender({ value: 'world', delay: 500 })

    // 立即检查 - 应该还是旧值
    expect(result.current).toBe('hello')

    // 快进时间
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // 现在应该是新值
    expect(result.current).toBe('world')
  })

  it('should handle delay of 0', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 0),
      { initialProps: { value: 'hello' } }
    )

    rerender({ value: 'world' })

    act(() => { vi.advanceTimersByTime(0) })

    expect(result.current).toBe('world')
  })
})
