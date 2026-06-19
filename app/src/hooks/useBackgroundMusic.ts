import { useEffect, useRef } from 'react'

export function useBackgroundMusic(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = 0.5
    audioRef.current = audio

    let started = false
    const start = () => {
      if (started) return
      started = true
      audio.play().catch(() => {})
    }

    window.addEventListener('pointerdown', start, { once: true })
    window.addEventListener('keydown', start, { once: true })

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
    }
  }, [src])
}
