import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

function getMusicSrc(pathname: string): string {
  if (pathname === '/starry/secret') return '/secret-music.mp3'
  if (pathname === '/starry/epilogue') return '/epilogue-music.mp3'
  return '/bg-music.mp3'
}

export default function StarryMusic() {
  const location = useLocation()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentSrcRef = useRef<string>('')
  const startedRef = useRef(false)

  useEffect(() => {
    const src = getMusicSrc(location.pathname)

    if (!audioRef.current) {
      const audio = new Audio(src)
      audio.loop = true
      audio.volume = 0.5
      audioRef.current = audio
      currentSrcRef.current = src

      const start = () => {
        if (startedRef.current) return
        startedRef.current = true
        audio.play().catch(() => {})
      }

      window.addEventListener('pointerdown', start, { once: true })
      window.addEventListener('keydown', start, { once: true })
      return
    }

    // 同一首歌在星空页之间切换时不重新加载，避免中断
    if (currentSrcRef.current === src) return

    const audio = audioRef.current
    currentSrcRef.current = src

    // 切换歌曲时先淡出再换源
    const fadeOut = () => {
      audio.src = src
      audio.load()
      audio.play().catch(() => {})
    }

    if (audio.paused) {
      fadeOut()
      return
    }

    // 简单淡出：直接切歌（浏览器自带音频切换会有短暂停顿，可接受）
    audio.pause()
    fadeOut()
  }, [location.pathname])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
    }
  }, [])

  return null
}
