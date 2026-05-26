import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Move, Pin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { memoirs } from '@/data/memoirs'

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 127.1) * 43758.5453
  return x - Math.floor(x)
}

const getStarPos = (id: string) => {
  const n = parseInt(id, 10)
  let xPct = 10 + seededRandom(n * 1.1) * 80
  let yPct = 10 + seededRandom(n * 2.3) * 80
  const cx = Math.abs(xPct - 50)
  const cy = Math.abs(yPct - 50)
  if (cx < 12 && cy < 12) {
    xPct = xPct < 50 ? xPct - 15 : xPct + 15
  }
  return { x: `${xPct}%`, y: `${yPct}%` }
}

function DraggableStar({
  memoir,
  x,
  y,
  draggable,
}: {
  memoir: (typeof memoirs)[0]
  x: string
  y: string
  draggable: boolean
}) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const size = 4 + memoir.brightness * 6

  return (
    <div
      className="absolute"
      style={{ left: x, top: y }}
    >
      <motion.button
        drag={draggable}
        dragMomentum={false}
        whileDrag={{ scale: 1.4, cursor: 'grabbing' }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
        onClick={() => {
          if (!isDragging) navigate(`/starry/${memoir.id}`)
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative z-10 ${draggable ? 'cursor-grab' : 'cursor-pointer'}`}
        style={{ x: '-50%', y: '-50%' }}
      >
        {/* 光晕 */}
        <span
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size * 5,
            height: size * 5,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, rgba(180,210,255,${0.1 + memoir.brightness * 0.2}) 0%, rgba(100,150,255,0) 70%)`,
            animation: `starPulse ${2 + (1 - memoir.brightness) * 2}s ease-in-out infinite`,
            animationDelay: `${seededRandom(parseInt(memoir.id)) * -3}s`,
          }}
        />

        {/* 星星本体 */}
        <span
          className="relative block rounded-full"
          style={{
            width: size,
            height: size,
            background: hovered
              ? 'radial-gradient(circle, #fff 0%, #aaccff 100%)'
              : 'radial-gradient(circle, #e8f0ff 0%, #9bb8e8 100%)',
            boxShadow: hovered
              ? `0 0 ${size * 2}px ${size}px rgba(180,210,255,0.5), 0 0 ${size * 4}px ${size * 2}px rgba(100,150,255,0.15)`
              : `0 0 ${size}px ${size / 2}px rgba(180,210,255,${0.15 + memoir.brightness * 0.25}), 0 0 ${size * 3}px ${size}px rgba(100,150,255,${0.03 + memoir.brightness * 0.08})`,
            transition: 'box-shadow 0.3s ease, background 0.3s ease',
          }}
        />

        {/* Tooltip */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-1/2 -translate-x-1/2 mt-3 pointer-events-none whitespace-nowrap z-20"
          >
            <div className="bg-black/70 backdrop-blur-md border border-white/15 rounded-lg px-4 py-2">
              <p className="text-xs text-white/50 font-body">{memoir.date}</p>
            </div>
          </motion.div>
        )}
      </motion.button>
    </div>
  )
}

export default function StarryEasterEgg() {
  const navigate = useNavigate()
  const [showText, setShowText] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [draggable, setDraggable] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 400)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [showVideo])

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

      {/* 全屏视频 - 硬切无淡入淡出 */}
      <video
        ref={videoRef}
        src="/starry-video.mp4"
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover z-[1] transition-opacity duration-700 ${showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onEnded={() => setShowVideo(false)}
        onClick={() => setShowVideo(false)}
      />

      {/* 可拖动星星 */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-700 ${showVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        {memoirs.map((m) => {
          const pos = getStarPos(m.id)
          return <DraggableStar key={m.id} memoir={m} x={pos.x} y={pos.y} draggable={draggable} />
        })}
      </div>

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

      {/* 切换拖动模式 */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        onClick={() => setDraggable((v) => !v)}
        className="absolute top-6 right-6 z-30 flex items-center gap-2 text-white/60 hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 hover:scale-105"
        title={draggable ? '切换为固定模式' : '切换为拖动模式'}
      >
        {draggable ? <Move size={16} /> : <Pin size={16} />}
        <span className="text-sm font-body">{draggable ? '可拖动' : '已固定'}</span>
      </motion.button>

      {/* 播放视频按钮 */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        onClick={() => setShowVideo(true)}
        className="absolute bottom-24 right-8 z-30 flex items-center gap-2 text-white/60 hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/5 px-5 py-3 rounded-full border border-white/10 hover:bg-white/10 hover:scale-105"
      >
        <Play size={16} fill="currentColor" />
        <span className="text-sm font-body">观看星轨</span>
      </motion.button>

      <style>{`
        @keyframes starPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
