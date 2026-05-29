import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue } from 'framer-motion'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMemoirs, type Memoir } from '@/data/memoirs'

function NebulaField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = w
    canvas.height = h

    const particles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] = []
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.5 + 0.1,
      })
    }

    let animId: number
    const draw = () => {
      ctx.fillStyle = '#080810'
      ctx.fillRect(0, 0, w, h)

      // 绘制柔和的星云团
      for (let i = 0; i < 5; i++) {
        const nx = w * (0.2 + i * 0.15)
        const ny = h * (0.3 + (i % 3) * 0.2)
        const gradient = ctx.createRadialGradient(nx, ny, 0, nx, ny, 200)
        gradient.addColorStop(0, `rgba(60, 40, 90, ${0.08 + i * 0.02})`)
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, w, h)
      }

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180, 170, 220, ${p.alpha})`
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)

    const onResize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
}

function PhotoFrame({ src, alt, rotation = -2.5 }: { src: string; alt: string; rotation?: number }) {
  return (
    <div className="photo-frame-wrapper flex-shrink-0 mx-auto md:mx-0">
      <div className="photo-frame" style={{ transform: `rotate(${rotation}deg)` }}>
        <div className="photo-mat">
          <img src={src} alt={alt} className="photo-image" loading="lazy" />
        </div>
      </div>
      {/* 钉子阴影 */}
      <div className="pin-shadow" />
      {/* 钉子 */}
      <div className="pin">
        <div className="pin-head" />
      </div>
    </div>
  )
}

export default function StarryMemoir() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [memoir, setMemoir] = useState<Memoir | null>(null)
  const [glassesPos, setGlassesPos] = useState(() => {
    try {
      const saved = localStorage.getItem('starry-glasses-position')
      return saved ? JSON.parse(saved) : { x: -148.8, y: 9.5, scale: 2.05 }
    } catch {
      return { x: -148.8, y: 9.5, scale: 2.05 }
    }
  })

  const x = useMotionValue(glassesPos.x)
  const y = useMotionValue(glassesPos.y)
  const [loading, setLoading] = useState(true)
  const [showVideo, setShowVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    getMemoirs().then((all) => {
      setMemoir(all.find((m) => m.id === id) || null)
      setLoading(false)
    })
  }, [id])

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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080810]">
      <NebulaField />

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

      <AnimatePresence mode="wait">
        {!showVideo ? (
          <motion.div
            key="content"
            className="relative z-20 h-full overflow-y-auto px-6 py-20 no-scrollbar"
            exit={{ x: '-30%', opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
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
                  {(() => {
                    const imgs = memoir.images || (memoir.image ? [memoir.image] : [])
                    if (imgs.length === 0) return null
                    return (
                      <div className="flex flex-wrap gap-4 flex-shrink-0">
                        {imgs.map((img, i) => (
                          <PhotoFrame
                            key={i}
                            src={img}
                            alt={memoir.title || '记忆'}
                            rotation={-3 + i * 2.5}
                          />
                        ))}
                      </div>
                    )
                  })()}
                </div>

                {/* 正文 — 严格按编辑框里的换行格式渲染 */}
                <div className="text-[1.0625rem] leading-[2] text-white/65 font-body">
                  {(() => {
                    const paragraphs = memoir.content.split(/\n/).filter(Boolean)
                    return paragraphs.map((para, i) => {
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
                    })
                  })()}
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

                {/* 老夏页面装饰 — 金丝眼镜（可拖拽、滚轮缩放，位置自动记忆） */}
                {memoir.title === '老夏' && (
                  <span className="hidden lg:block absolute -right-28 top-10 pointer-events-auto">
                    <motion.span
                      drag
                      dragMomentum={false}
                      whileHover={{ cursor: 'grab' }}
                      whileDrag={{ cursor: 'grabbing' }}
                      style={{ x, y, rotate: -6, scale: glassesPos.scale }}
                      onWheel={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        const nextScale = Math.max(0.3, Math.min(2.5, glassesPos.scale + (e.deltaY > 0 ? -0.05 : 0.05)))
                        const next = { ...glassesPos, scale: nextScale }
                        setGlassesPos(next)
                        localStorage.setItem('starry-glasses-position', JSON.stringify(next))
                      }}
                      onDragEnd={() => {
                        const next = { x: x.get(), y: y.get(), scale: glassesPos.scale }
                        setGlassesPos(next)
                        localStorage.setItem('starry-glasses-position', JSON.stringify(next))
                      }}
                      className="block"
                    >
                      <motion.img
                        src="/golden-glasses.png"
                        alt="金丝眼镜"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="w-24"
                        draggable={false}
                      />
                    </motion.span>
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="video"
            className="relative z-20 h-full flex items-center justify-center"
            initial={{ x: '30%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <video
              ref={videoRef}
              src="/next-video.mp4"
              autoPlay
              playsInline
              className="max-w-full max-h-full object-contain"
              onEnded={() => {
                if (videoRef.current) {
                  videoRef.current.pause()
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .photo-frame-wrapper {
          position: relative;
          display: inline-block;
        }
        .photo-frame {
          position: relative;
          background: #ebe5da;
          padding: 8px 8px 28px 8px;
          border-radius: 2px;
          transform: rotate(-2.5deg);
          box-shadow:
            inset 0 0 30px rgba(0,0,0,0.04),
            0 1px 2px rgba(0,0,0,0.12),
            0 4px 8px rgba(0,0,0,0.08),
            0 12px 24px rgba(0,0,0,0.06),
            0 24px 48px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.06);
        }
        .photo-mat {
          background: #f7f4ee;
          padding: 4px;
          box-shadow: inset 0 0 8px rgba(0,0,0,0.04);
        }
        .photo-image {
          display: block;
          width: 160px;
          height: 200px;
          object-fit: cover;
          filter: sepia(6%) contrast(104%) saturate(96%);
          box-shadow: inset 0 0 6px rgba(0,0,0,0.08);
          border-radius: 1px;
        }
        .pin {
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 14px;
          height: 14px;
          z-index: 2;
        }
        .pin-head {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle at 32% 32%, #e0e0e0, #a0a0a0 60%, #707070);
          box-shadow:
            0 1px 3px rgba(0,0,0,0.35),
            0 0 0 0.5px rgba(0,0,0,0.1),
            inset 0 -1px 2px rgba(0,0,0,0.15);
        }
        .pin-head::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #c0c0c0, #808080);
          box-shadow: inset 0 1px 1px rgba(0,0,0,0.2);
        }
        .pin-shadow {
          position: absolute;
          top: -2px;
          left: 50%;
          transform: translateX(-40%) rotate(30deg);
          width: 16px;
          height: 3px;
          background: rgba(0,0,0,0.15);
          border-radius: 50%;
          filter: blur(1px);
          z-index: 1;
        }
        .drop-cap {
          float: left;
          font-size: 2.4em;
          line-height: 0.9;
          padding-right: 8px;
          padding-top: 2px;
          font-family: Georgia, 'Times New Roman', serif;
          color: rgba(255,255,255,0.92);
          font-weight: 400;
        }
        .paragraph-divider {
          text-align: center;
          color: rgba(255,255,255,0.18);
          font-size: 0.7rem;
          margin: 1.2rem 0;
          letter-spacing: 0.3em;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
