import { useEffect, type RefObject } from 'react'

export function useAutoPlayVideo(videoRef: RefObject<HTMLVideoElement | null>, showVideo: boolean) {
  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [showVideo, videoRef])
}
