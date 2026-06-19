import { memo, useEffect, useState } from 'react'
import { motion, useMotionValue } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { seededRandom } from '@/utils/starry'
import type { Memoir } from '@/data/memoirs'

interface DraggableStarProps {
  memoir: Memoir
  x: string
  y: string
  draggable: boolean
  onPositionChange?: (id: string, x: number, y: number) => void
}

function DraggableStar({
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

  const motionX = useMotionValue((parseFloat(x) / 100) * window.innerWidth)
  const motionY = useMotionValue((parseFloat(y) / 100) * window.innerHeight)

  // 当外部传入的位置变化时（初始加载、云端同步），更新 motion 值
  useEffect(() => {
    motionX.set((parseFloat(x) / 100) * window.innerWidth)
    motionY.set((parseFloat(y) / 100) * window.innerHeight)
  }, [x, y, motionX, motionY])

  // 窗口大小变化时，按百分比重新计算像素位置
  useEffect(() => {
    const handleResize = () => {
      motionX.set((parseFloat(x) / 100) * window.innerWidth)
      motionY.set((parseFloat(y) / 100) * window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [x, y, motionX, motionY])

  return (
    <motion.button
      drag={draggable}
      dragMomentum={false}
      whileDrag={{ scale: 1.4, cursor: 'grabbing' }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setTimeout(() => setIsDragging(false), 50)

        if (!onPositionChange) return

        const finalXPx = motionX.get()
        const finalYPx = motionY.get()

        const newX = Math.max(5, Math.min(95, (finalXPx / window.innerWidth) * 100))
        const newY = Math.max(5, Math.min(95, (finalYPx / window.innerHeight) * 100))

        onPositionChange(memoir.id, newX, newY)
      }}
      onClick={() => {
        if (!isDragging) navigate(`/starry/${memoir.id}`)
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`absolute left-0 top-0 z-10 ${draggable ? 'cursor-grab' : 'cursor-pointer'}`}
      style={{
        x: motionX,
        y: motionY,
        translateX: '-50%',
        translateY: '-50%',
      }}
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
  )
}

export default memo(DraggableStar)
