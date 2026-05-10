import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAsync } from './useAsync'

describe('useAsync', () => {
  it('should handle successful async function', async () => {
    const asyncFn = vi.fn(() => Promise.resolve('success'))
    const { result } = renderHook(() => useAsync(asyncFn, true))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe('success')
    expect(result.current.error).toBe(null)
    expect(asyncFn).toHaveBeenCalledTimes(1)
  })

  it('should handle async function error', async () => {
    const error = new Error('Test error')
    const asyncFn = vi.fn(() => Promise.reject(error))

    // 捕获预期的错误
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useAsync(asyncFn, true))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(error)

    consoleError.mockRestore()
  })

  it('should not execute immediately when immediate is false', () => {
    const asyncFn = vi.fn(() => Promise.resolve('success'))
    const { result } = renderHook(() => useAsync(asyncFn, false))

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBe(null)
    expect(asyncFn).not.toHaveBeenCalled()
  })
})
