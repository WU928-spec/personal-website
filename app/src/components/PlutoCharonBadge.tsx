import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PlutoCharonBadge() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height
    const cx = w / 2
    const cy = h / 2

    const stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005,
    }))

    let angle = 0
    const pluto = { r: 10, orbitR: 18, color: '#7BA7BC' }
    const charon = { r: 6, orbitR: 50, color: '#9AA8B8' }

    let animId: number
    const draw = () => {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, w, h)

      // 星星
      stars.forEach((s) => {
        s.alpha += s.speed
        const a = 0.3 + Math.sin(s.alpha) * 0.3 + 0.4
        ctx.fillStyle = `rgba(255,255,255,${a})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      })

      angle += 0.003

      const px = cx + Math.cos(angle) * pluto.orbitR
      const py = cy + Math.sin(angle) * pluto.orbitR
      const cx_ = cx + Math.cos(angle + Math.PI) * charon.orbitR
      const cy_ = cy + Math.sin(angle + Math.PI) * charon.orbitR

      // 轨道线
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, pluto.orbitR, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx, cy, charon.orbitR, 0, Math.PI * 2)
      ctx.stroke()

      // 连接线
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(cx_, cy_)
      ctx.stroke()

      // 冥王星
      ctx.fillStyle = pluto.color
      ctx.beginPath()
      ctx.arc(px, py, pluto.r, 0, Math.PI * 2)
      ctx.fill()
      // 心形
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 1
      const hs = 6
      ctx.beginPath()
      ctx.moveTo(px, py - 2)
      ctx.bezierCurveTo(px, py - 4, px - hs / 2, py - 4, px - hs / 2, py - 2)
      ctx.bezierCurveTo(px - hs / 2, py, px, py + 2, px, py + 3)
      ctx.bezierCurveTo(px, py + 2, px + hs / 2, py, px + hs / 2, py - 2)
      ctx.bezierCurveTo(px + hs / 2, py - 4, px, py - 4, px, py - 2)
      ctx.stroke()

      // 卡戎
      ctx.fillStyle = charon.color
      ctx.beginPath()
      ctx.arc(cx_, cy_, charon.r, 0, Math.PI * 2)
      ctx.fill()
      // 北极红点
      ctx.fillStyle = '#C44536'
      ctx.beginPath()
      ctx.arc(
        cx_ + Math.cos(angle + Math.PI) * charon.r * 0.5,
        cy_ + Math.sin(angle + Math.PI) * charon.r * 0.5,
        2,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)

    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <button
      onClick={() => navigate('/starry')}
      className="relative mx-auto mb-6 block cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#1a1a2e] shadow-lg"
      style={{ width: 320, height: 140 }}
      title="✨"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ width: 320, height: 140 }}
      />
    </button>
  )
}
