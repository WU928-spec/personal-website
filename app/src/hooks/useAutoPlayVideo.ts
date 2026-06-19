import { useEffect, type RefObject } from 'react'

export function useAutoPlayVideo(videoRef: RefObject<HTMLVideoElement | null>, showVideo: boolean) {
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (showVideo) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [showVideo, videoRef])
}
