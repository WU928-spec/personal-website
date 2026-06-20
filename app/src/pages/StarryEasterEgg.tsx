import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, X } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getMemoirs, getStarrySecret, type Memoir, type StarrySecret } from '@/data/memoirs'
import { getStarPos } from '@/utils/starry'
import DraggableStar from '@/components/starry/DraggableStar'

const CLICKED_KEY = 'starry-bright-clicked'
const COMPLETED_KEY = 'starry-completed'

function loadClickedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(CLICKED_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return new Set(parsed)
    }
  } catch {
    // ignore
  }
  return new Set()
}

function saveClickedIds(ids: Set<string>) {
  try {
    localStorage.setItem(CLICKED_KEY, JSON.stringify([...ids]))
  } catch {
    // ignore
  }
}

function loadCompleted(): boolean {
  try {
    return localStorage.getItem(COMPLETED_KEY) === 'true'
  } catch {
    return false
  }
}

export default function StarryEasterEgg() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showText, setShowText] = useState(false)
  const [showVideo, setShowVideo] = useState(location.state?.playVideo === true)
  const [memoirs, setMemoirs] = useState<Memoir[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [clickedIds, setClickedIds] = useState<Set<string>>(loadClickedIds)
  const [secret, setSecret] = useState<StarrySecret | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [hasCompleted] = useState(loadCompleted)
  const [bgLoaded, setBgLoaded] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refreshMemoirs = useCallback(async () => {
    const list = await getMemoirs()
    setMemoirs(list)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refreshMemoirs()
    getStarrySecret().then(setSecret)
  }, [refreshMemoirs])

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 400)
    return () => clearTimeout(timer)
  }, [])

  // 检查背景图是否已缓存，避免缓存命中时 onLoad 不同步触发导致的闪烁
  useEffect(() => {
    const img = new Image()
    img.onload = () => setBgLoaded(true)
    img.src = '/starry-bg.jpg'
    if (img.complete) {
      setBgLoaded(true)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (videoEndTimerRef.current) {
        clearTimeout(videoEndTimerRef.current)
        videoEndTimerRef.current = null
      }
    }
  }, [])

  // 视频自动播放：首次显示时尝试播放，并监听 canplay 状态
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleCanPlay = () => setVideoReady(true)
    const handleWaiting = () => setVideoReady(false)

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('canplaythrough', handleCanPlay)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('playing', handleCanPlay)

    if (showVideo) {
      video.currentTime = 0
      // 已经就绪则立即播放，否则等待 canplay 事件
      if (video.readyState >= 3) {
        setVideoReady(true)
        video.play().catch(() => {})
      } else {
        video.load()
      }
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('canplaythrough', handleCanPlay)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('playing', handleCanPlay)
    }
  }, [showVideo])

  const brightIds = useMemo(
    () => new Set(memoirs.filter((m) => m.brightness >= 1).map((m) => m.id)),
    [memoirs]
  )

  const allBrightClicked = useMemo(() => {
    if (brightIds.size === 0) return false
    return [...brightIds].every((id) => clickedIds.has(id))
  }, [brightIds, clickedIds])

  const isTransitioningRef = useRef(false)

  useEffect(() => {
    if (location.state?.playVideo) return
    if (hasCompleted) return
    if (allBrightClicked && secret && secret.pages.length > 0 && !isTransitioningRef.current) {
      isTransitioningRef.current = true
      setIsTransitioning(true)
      const timer = setTimeout(() => {
        navigate('/starry/secret')
      }, 1000)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [allBrightClicked, secret, navigate, location.state, hasCompleted])

  const handleStarClick = useCallback((id: string) => {
    setClickedIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      saveClickedIds(next)
      return next
    })
  }, [])

  const remainingCount = useMemo(() => {
    return [...brightIds].filter((id) => !clickedIds.has(id)).length
  }, [brightIds, clickedIds])

  const stars = useMemo(
    () =>
      memoirs.map((m) => {
        const pos = getStarPos(m.id, { x: m.x, y: m.y })
        return (
          <DraggableStar
            key={m.id}
            memoir={m}
            x={pos.x}
            y={pos.y}
            draggable={false}
            onClick={handleStarClick}
          />
        )
      }),
    [memoirs, handleStarClick]
  )

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050508]">
      {/* 背景图：用 img 元素加载，配合预加载缓存可立即显示，并在加载完成后淡入 */}
      <img
        src="/starry-bg.jpg"
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 z-0 w-full h-full object-cover transition-opacity duration-700 ${
          bgLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setBgLoaded(true)}
      />

      {/* 全屏视频层 */}
      <div
        className={`absolute inset-0 z-[1] w-full h-full transition-opacity duration-700 ${showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <video
          ref={videoRef}
          src="/starry-video.mp4"
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          onEnded={() => {
            videoEndTimerRef.current = setTimeout(() => {
              navigate('/starry/epilogue')
            }, 2000)
          }}
          onClick={() => {
            const video = videoRef.current
            if (!video) return
            if (video.paused && videoReady) {
              video.play().catch(() => {})
            } else if (!video.paused) {
              video.pause()
            }
          }}
        />

        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setShowVideo(false)
          }}
          className="absolute top-6 right-6 z-10 flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 backdrop-blur-sm bg-black/20 px-3 py-2 rounded-full border border-white/10"
          aria-label="关闭视频"
        >
          <X size={18} />
        </button>

        {/* 缓冲提示 */}
        {showVideo && !videoReady && (
          <div className="absolute inset-0 z-[2] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 text-white/70">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-6 h-6 border-2 border-white/30 border-t-white/80 rounded-full"
              />
              <span className="text-sm font-body tracking-widest">正在加载星轨…</span>
            </div>
          </div>
        )}
      </div>

      {/* 星星层 */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-700 ${showVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        {stars}
      </div>

      {/* 首屏加载指示器 */}
      {isLoading && (
        <div className="absolute inset-0 z-[25] flex items-center justify-center bg-[#050508]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-white/50">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 border-2 border-white/30 border-t-white/80 rounded-full"
            />
            <span className="text-sm font-body tracking-widest">正在载入星空...</span>
          </div>
        </div>
      )}

      {/* UI 层 */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-30 flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 backdrop-blur-sm bg-white/5 px-4 py-2 rounded-full border border-white/10"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-body">返回</span>
      </motion.button>

      {showText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none"
        >
          <p className="text-xs text-white/30 font-body tracking-widest uppercase">
            点击星星，阅读一段光年之外的记忆
          </p>
        </motion.div>
      )}

      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none max-w-md px-6"
        >
          <p className="text-sm text-white/25 font-body leading-relaxed">
            在距离太阳 59 亿公里的地方，有一颗心永远朝向它的伴星
          </p>
        </motion.div>
      )}

      {/* 高亮星星状态提示 */}
      {remainingCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 text-white/40 text-xs font-body tracking-widest pointer-events-none"
        >
          还有 {remainingCount} 颗最亮的星等待点亮
        </motion.div>
      )}

      {allBrightClicked && hasCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
        >
          <p className="text-white/40 text-xs font-body tracking-widest pointer-events-none">
            所有亮星已点亮
          </p>
          <button
            type="button"
            onClick={() => navigate('/starry/secret')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300 backdrop-blur-sm bg-white/10 hover:bg-white/15 px-5 py-2.5 rounded-full border border-white/20"
          >
            <span className="text-sm font-body tracking-widest">进入信件</span>
          </button>
        </motion.div>
      )}

      {/* 全部点亮后的平滑过渡遮罩 */}
      <div
        className={`absolute inset-0 z-[40] bg-[#050508] transition-opacity duration-1000 ease-in ${
          isTransitioning ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

    </div>
  )
}
