import { useState, useEffect } from 'react'

/**
 * Returns a tick value that increments every `interval` ms.
 * Useful for triggering periodic re-computations (e.g. live timer displays).
 */
export function useLiveTick(interval = 1000): number {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), interval)
    return () => clearInterval(id)
  }, [interval])
  return tick
}
