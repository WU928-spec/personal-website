import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
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
  const [loading, setLoading] = useState(true)

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

      {/* Content */}
      <div className="relative z-20 flex items-center justify-center h-full px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="max-w-3xl w-full"
        >
          {/* 日期 + 标题 + 相框 */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
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

          <div className="relative">
            <div className="w-px h-6 bg-gradient-to-b from-white/40 to-transparent mb-3" />
            <p className="text-[1.0625rem] leading-[2] text-white/65 font-body whitespace-pre-wrap">
              {memoir.content}
            </p>
          </div>
        </motion.div>
      </div>

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
      `}</style>
    </div>
  )
}
