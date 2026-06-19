import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getMemoirs, getStarrySecret, type Memoir } from '@/data/memoirs'
import { getStarPos } from '@/utils/starry'
import { useAutoPlayVideo } from '@/hooks/useAutoPlayVideo'
import DraggableStar from '@/components/starry/DraggableStar'

const CLICKED_KEY = 'starry-bright-clicked'

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

export default function StarryEasterEgg() {
  const navigate = useNavigate()
  const [showText, setShowText] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [memoirs, setMemoirs] = useState<Memoir[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [clickedIds, setClickedIds] = useState<Set<string>>(loadClickedIds)
  const [secretMessage, setSecretMessage] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const refreshMemoirs = useCallback(async () => {
    const list = await getMemoirs()
    setMemoirs(list)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refreshMemoirs()
    getStarrySecret().then(setSecretMessage)
  }, [refreshMemoirs])

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 400)
    return () => clearTimeout(timer)
  }, [])

  useAutoPlayVideo(videoRef, showVideo)

  const brightIds = useMemo(
    () => new Set(memoirs.filter((m) => m.brightness >= 1).map((m) => m.id)),
    [memoirs]
  )

  const allBrightClicked = useMemo(() => {
    if (brightIds.size === 0) return false
    return [...brightIds].every((id) => clickedIds.has(id))
  }, [brightIds, clickedIds])

  useEffect(() => {
    if (allBrightClicked && secretMessage) {
      setShowSecret(true)
    }
  }, [allBrightClicked, secretMessage])

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
      {/* 背景图 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/starry-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* 全屏视频 */}
      <video
        ref={videoRef}
        src="/starry-video.mp4"
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover z-[1] transition-opacity duration-700 ${showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onEnded={() => setShowVideo(false)}
        onClick={() => setShowVideo(false)}
      />

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

      {/* 剩余高亮星星提示 */}
      {remainingCount > 0 && !showSecret && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 text-white/40 text-xs font-body tracking-widest pointer-events-none"
        >
          还有 {remainingCount} 颗最亮的星等待点亮
        </motion.div>
      )}

      {/* 播放视频按钮 */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
        onClick={() => setShowVideo(true)}
        className="absolute bottom-8 right-8 z-30 flex items-center gap-2 text-white/60 hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/5 px-5 py-3 rounded-full border border-white/10 hover:bg-white/10 hover:scale-105"
      >
        <Play size={16} fill="currentColor" />
        <span className="text-sm font-body">观看星轨</span>
      </motion.button>

      {/* 隐藏告白文字 */}
      {showSecret && secretMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 z-40 flex items-center justify-center px-6"
          onClick={() => setShowSecret(false)}
        >
          <div className="relative max-w-2xl w-full bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 text-center">
            <button
              onClick={() => setShowSecret(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <p className="text-[1.125rem] md:text-[1.375rem] leading-[2] text-white/85 font-body whitespace-pre-line">
              {secretMessage}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
