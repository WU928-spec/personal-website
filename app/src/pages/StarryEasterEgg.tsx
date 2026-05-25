import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { memoirs, getStarPosition } from '@/data/memoirs'
import type { Memoir } from '@/data/memoirs'

interface Star {
  memoir: Memoir
  x: number
  y: number
  baseR: number
  targetR: number
  phase: number
}

export default function StarryEasterEgg() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const starsRef = useRef<Star[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [showText, setShowText] = useState(false)
  const mouseRef = useRef({ x: -1, y: -1 })

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 400)
    return () => clearTimeout(timer)
  }, [])

  // Initialize stars
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const w = rect.width
    const h = rect.height

    starsRef.current = memoirs.map((m) => {
      const pos = getStarPosition(m.id, w, h)
      const baseR = 2 + m.brightness * 3.5
      return {
        memoir: m,
        x: pos.x,
        y: pos.y,
        baseR,
        targetR: baseR,
        phase: Math.random() * Math.PI * 2,
      }
    })
  }, [])

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    let w = container.clientWidth
    let h = container.clientHeight

    const resize = () => {
      w = container.clientWidth
      h = container.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Re-position stars on resize
      starsRef.current = memoirs.map((m) => {
        const pos = getStarPosition(m.id, w, h)
        const existing = starsRef.current.find((s) => s.memoir.id === m.id)
        const baseR = 5 + m.brightness * 5
        return {
          memoir: m,
          x: pos.x,
          y: pos.y,
          baseR,
          targetR: existing ? existing.targetR : baseR,
          phase: existing ? existing.phase : Math.random() * Math.PI * 2,
        }
      })
    }
    resize()

    let animId: number
    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      // Draw faint connections between nearby bright stars
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < starsRef.current.length; i++) {
        for (let j = i + 1; j < starsRef.current.length; j++) {
          const s1 = starsRef.current[i]
          const s2 = starsRef.current[j]
          const dx = s1.x - s2.x
          const dy = s1.y - s2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const opacity = (1 - dist / 120) * 0.03
            ctx.strokeStyle = `rgba(255,255,255,${opacity})`
            ctx.beginPath()
            ctx.moveTo(s1.x, s1.y)
            ctx.lineTo(s2.x, s2.y)
            ctx.stroke()
          }
        }
      }

      // Draw stars
      for (const s of starsRef.current) {
        // Smooth radius transition
        s.targetR += (s.baseR - s.targetR) * 0.1

        // Twinkle
        s.phase += 0.008 + s.memoir.brightness * 0.015
        const twinkle = 0.85 + Math.sin(s.phase) * 0.15
        const alpha = 0.65 + s.memoir.brightness * 0.35

        const isHovered = hoveredId === s.memoir.id
        const r = (isHovered ? s.targetR * 1.3 : s.targetR) * twinkle

        // Glow
        const glowR = r * 4
        const gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR)
        const glowAlpha = isHovered ? alpha * 0.4 : alpha * 0.15
        gradient.addColorStop(0, `rgba(255,255,255,${glowAlpha})`)
        gradient.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.fillStyle = `rgba(255,255,255,${isHovered ? Math.min(alpha + 0.3, 1) : alpha})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      animId = requestAnimationFrame(() => draw())
    }
    animId = requestAnimationFrame(() => draw())

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [hoveredId])

  const findStarAt = useCallback((x: number, y: number) => {
    let nearest: Star | null = null
    let nearestDist = Infinity

    for (const s of starsRef.current) {
      const dx = x - s.x
      const dy = y - s.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const hitRadius = Math.max(28, s.baseR * 4)

      if (dist < hitRadius && dist < nearestDist) {
        nearest = s
        nearestDist = dist
      }
    }

    return nearest
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      mouseRef.current = { x, y }

      setHoveredId(findStarAt(x, y)?.memoir.id ?? null)
    },
    [findStarAt]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const star = findStarAt(x, y)

      if (star) {
        navigate(`/starry/${star.memoir.id}`)
      }
    },
    [findStarAt, navigate]
  )

  const hoveredMemoir = hoveredId ? memoirs.find((m) => m.id === hoveredId) : null

  return (
    <div ref={containerRef} className="relative w-screen h-screen overflow-hidden bg-[#0a0a12]">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/starry-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-black/40 z-[1]" />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 cursor-pointer"
        onMouseMove={handleMouseMove}
        onPointerUp={handlePointerUp}
        onMouseLeave={() => setHoveredId(null)}
      />

      {/* Back button */}
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

      {/* Top text */}
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

      {/* Bottom quote */}
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

      {/* Hover tooltip */}
      {hoveredMemoir && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute z-30 pointer-events-none"
          style={{
            left: mouseRef.current.x + 16,
            top: mouseRef.current.y - 8,
          }}
        >
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2">
            <p className="text-sm text-white/90 font-body whitespace-nowrap">
              {hoveredMemoir.title}
            </p>
            <p className="text-xs text-white/40 mt-0.5">{hoveredMemoir.date}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
