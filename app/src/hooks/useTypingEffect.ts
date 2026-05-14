import { useState, useEffect } from 'react'

export function useTypingEffect(text: string, speed = 80, delay = 500) {
  const [displayed, setDisplayed] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let index = 0
    let cursorBlinks = 0
    let cursorInterval: ReturnType<typeof setInterval>

    const startTimeout = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayed(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(typeInterval)
          cursorInterval = setInterval(() => {
            cursorBlinks++
            setShowCursor((prev) => !prev)
            if (cursorBlinks >= 6) {
              clearInterval(cursorInterval)
              setShowCursor(false)
              setDone(true)
            }
          }, 500)
        }
      }, speed)

      return () => {
        clearInterval(typeInterval)
        clearInterval(cursorInterval)
      }
    }, delay)

    return () => {
      clearTimeout(startTimeout)
      clearInterval(cursorInterval)
    }
  }, [text, speed, delay])

  return { displayed, showCursor, done }
}
