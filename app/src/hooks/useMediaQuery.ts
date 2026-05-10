import { useState, useEffect } from 'react'

/**
 * useMediaQuery - 媒体查询 hook
 * @param query - 媒体查询字符串
 * @returns 是否匹配
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    const media = window.matchMedia(query)

    const updateMatch = () => {
      setMatches(media.matches)
    }

    // 初始检查
    updateMatch()

    // 监听变化
    media.addEventListener('change', updateMatch)

    return () => {
      media.removeEventListener('change', updateMatch)
    }
  }, [query])

  return matches
}
