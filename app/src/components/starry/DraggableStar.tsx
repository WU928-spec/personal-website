import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { seededRandom } from '@/utils/starry'
import type { Memoir } from '@/data/memoirs'

interface DraggableStarProps {
  memoir: Memoir
  x: string
  y: string
  draggable: boolean
  onPositionChange?: (x: number, y: number) => void
}

export default function DraggableStar({
  memoir,
  x,
  y,
  draggable,
  onPositionChange,
}: DraggableStarProps) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const size = 4 + memoir.brightness * 6

  return (
    <div className="absolute" style={{ left: x, top: y }}>
      <motion.button
        drag={draggable}
        dragMomentum={false}
        whileDrag={{ scale: 1.4, cursor: 'grabbing' }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(_, info) => {
          setTimeout(() => setIsDragging(false), 50)

          if (!onPositionChange) return

          // 忽略微小移动（避免点击被误判为拖动）
          const threshold = 3
          if (Math.abs(info.offset.x) < threshold && Math.abs(info.offset.y) < threshold) {
            return
          }

          // 原始位置（百分比 → 像素）
          const origXPx = (parseFloat(x) / 100) * window.innerWidth
          const origYPx = (parseFloat(y) / 100) * window.innerHeight

          // 拖动后的新位置（像素）
          const newXPx = origXPx + info.offset.x
          const newYPx = origYPx + info.offset.y

          // 转回百分比，并限制在 5% ~ 95% 范围内
          const newX = Math.max(5, Math.min(95, (newXPx / window.innerWidth) * 100))
          const newY = Math.max(5, Math.min(95, (newYPx / window.innerHeight) * 100))

          onPositionChange(newX, newY)
        }}
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
