import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue } from 'framer-motion'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMemoirs, type Memoir } from '@/data/memoirs'
import NebulaField from '@/components/starry/NebulaField'
import PhotoFrame from '@/components/starry/PhotoFrame'

interface GlassesPosition {
  x: number
  y: number
  scale: number
}

const DEFAULT_GLASSES_POS: GlassesPosition = { x: 0, y: 0, scale: 1 }

function loadGlassesPosition(): GlassesPosition {
  try {
    const saved = localStorage.getItem('starry-glasses-position')
    if (saved) {
      const parsed = JSON.parse(saved) as unknown
      if (
        parsed &&
        typeof parsed === 'object' &&
        'x' in parsed &&
        'y' in parsed &&
        'scale' in parsed
      ) {
        return parsed as GlassesPosition
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_GLASSES_POS
}

export default function StarryMemoir() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [memoir, setMemoir] = useState<Memoir | null>(null)
  const [glassesPos, setGlassesPos] = useState<GlassesPosition>(loadGlassesPosition)

  const x = useMotionValue(glassesPos.x)
  const y = useMotionValue(glassesPos.y)
  const [loading, setLoading] = useState(true)
  const [showVideo, setShowVideo] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const glassesRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    getMemoirs().then((all) => {
      setMemoir(all.find((m) => m.id === id) || null)
      setLoading(false)
    })
  }, [id])

  // 视频播放控制：替代 useAutoPlayVideo，添加 canplay 状态检测
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

  // 金丝眼镜滚轮缩放：必须使用 { passive: false } 才能阻止默认滚动
  useEffect(() => {
    const el = glassesRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation()
      e.preventDefault()
      setGlassesPos((prev) => {
        const nextScale = Math.max(0.3, Math.min(2.5, prev.scale + (e.deltaY > 0 ? -0.05 : 0.05)))
        const next = { ...prev, scale: nextScale }
        try {
          localStorage.setItem('starry-glasses-position', JSON.stringify(next))
        } catch {
          // ignore
        }
        return next
      })
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  if (loading) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-[#080810] flex items-center justify-center">
        <NebulaField />
        <div className="relative z-10 text-white/30 text-sm font-body">加载中...</div>
      </div>
    )
  }

  if (!memoir) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-[#080810] flex items-center justify-center">
        <NebulaField />
        <div className="relative z-10 text-center text-white/60">
          <p className="text-lg">这颗星星尚未亮起</p>
          <button
            onClick={() => navigate('/starry')}
            className="mt-4 flex items-center gap-2 mx-auto text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">返回星空</span>
          </button>
        </div>
      </div>
    )
  }

  const images = memoir.images || (memoir.image ? [memoir.image] : [])
  const paragraphs = memoir.content.split(/\n/).filter(Boolean)

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080810]">
      <NebulaField />

      <AnimatePresence>
        {!showVideo && (
          <motion.div
            key="content"
            className="relative z-20 h-full overflow-y-auto px-6 py-20 no-scrollbar"
            exit={{ x: '-30%', opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {/* Back button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              onClick={() => navigate('/starry')}
              className="absolute top-6 left-6 z-30 flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 backdrop-blur-sm bg-white/5 px-4 py-2 rounded-full border border-white/10"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-body">返回星空</span>
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="max-w-3xl w-full mx-auto"
            >
              <div className="relative pl-5">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-white/40 via-white/15 to-transparent" />

                {/* 日期 + 标题 + 相框 */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/30 font-body tracking-widest uppercase mb-3">
                      {memoir.date}
                    </p>
                    {memoir.title && (
                      <h1 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-medium text-white/95 tracking-wide leading-tight">
                        {memoir.title}
                      </h1>
                    )}
                  </div>
                  {images.length > 0 && (
                    <div className="flex flex-wrap gap-4 flex-shrink-0">
                      {images.map((img, i) => (
                        <PhotoFrame
                          key={i}
                          src={img}
                          alt={memoir.title || '记忆'}
                          rotation={-3 + i * 2.5}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* 正文 */}
                <div className="text-[1.0625rem] leading-[2] text-white/65 font-body">
                  {paragraphs.map((para, i) => {
                    if (i === 0) {
                      const first = para[0] || ''
                      const rest = para.slice(1)
                      return (
                        <p key={i} className="mb-0">
                          <span className="drop-cap">{first}</span>
                          {rest}
                        </p>
                      )
                    }
                    return <p key={i} className="mt-3">{para}</p>
                  })}
                </div>

                {/* 冬雨专属：底部翻页箭头 */}
                {memoir.title === '2月26日 凌晨 冬雨' && (
                  <div className="mt-12 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.1, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowVideo(true)}
                      className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors"
                    >
                      <span className="text-sm font-body tracking-widest">下一页</span>
                      <ChevronRight size={20} />
                    </motion.button>
                  </div>
                )}

                {/* 老夏页面装饰 — 金丝眼镜 */}
                {memoir.title === '老夏' && (
                  <motion.span
                    ref={glassesRef}
                    drag
                    dragMomentum={false}
                    whileHover={{ cursor: 'grab' }}
                    whileDrag={{ cursor: 'grabbing' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    style={{ x, y, rotate: -6, scale: glassesPos.scale }}
                    onDragEnd={() => {
                      const next = { x: x.get(), y: y.get(), scale: glassesPos.scale }
                      setGlassesPos(next)
                      try {
                        localStorage.setItem('starry-glasses-position', JSON.stringify(next))
                      } catch {
                        // ignore
                      }
                    }}
                    className="fixed top-16 left-[55%] lg:top-20 lg:left-[58%] z-30 pointer-events-auto w-16 lg:w-20"
                  >
                    <img
                      src="/golden-glasses.png"
                      alt="金丝眼镜"
                      className="w-full"
                      draggable={false}
                    />
                  </motion.span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {showVideo && (
          <motion.div
            key="video"
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => setShowVideo(false)}
              className="absolute bottom-8 left-6 z-50 flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 backdrop-blur-sm bg-white/5 px-4 py-2 rounded-full border border-white/10"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-body">返回</span>
            </motion.button>
            <video
              ref={videoRef}
              src="/next-video.mp4"
              autoPlay
              playsInline
              preload="auto"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onEnded={() => {
                if (videoRef.current) {
                  videoRef.current.pause()
                }
              }}
            />

            {/* 缓冲提示 */}
            {showVideo && !videoReady && (
              <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3 text-white/70">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-white/30 border-t-white/80 rounded-full"
                  />
                  <span className="text-sm font-body tracking-widest">正在加载视频…</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
