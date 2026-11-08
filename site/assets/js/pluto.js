const canvas = document.getElementById('pluto-charon')
if (canvas) {
  const context = canvas.getContext('2d')
  if (context) {
    const width = 640
    const height = 280
    const centerX = width / 2
    const centerY = height / 2
    const stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.4 + 0.6,
      phase: Math.random(),
      speed: Math.random() * 0.02 + 0.005,
    }))
    let angle = 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const draw = () => {
      context.fillStyle = '#1a1a2e'
      context.fillRect(0, 0, width, height)
      for (const star of stars) {
        star.phase += star.speed
        context.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(star.phase) * 0.3 + 0.4})`
        context.beginPath()
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        context.fill()
      }
      if (!reducedMotion) angle += 0.003
      const pluto = { x: centerX + Math.cos(angle) * 36, y: centerY + Math.sin(angle) * 36 }
      const charon = { x: centerX + Math.cos(angle + Math.PI) * 100, y: centerY + Math.sin(angle + Math.PI) * 100 }
      context.strokeStyle = '#ffffff0f'
      context.lineWidth = 2
      context.beginPath()
      context.arc(centerX, centerY, 36, 0, Math.PI * 2)
      context.stroke()
      context.beginPath()
      context.arc(centerX, centerY, 100, 0, Math.PI * 2)
      context.stroke()
      context.strokeStyle = '#ffffff14'
      context.beginPath()
      context.moveTo(pluto.x, pluto.y)
      context.lineTo(charon.x, charon.y)
      context.stroke()
      context.fillStyle = '#7ba7bc'
      context.beginPath()
      context.arc(pluto.x, pluto.y, 20, 0, Math.PI * 2)
      context.fill()
      context.strokeStyle = '#ffffff80'
      context.lineWidth = 2
      context.beginPath()
      context.moveTo(pluto.x, pluto.y - 4)
      context.bezierCurveTo(pluto.x, pluto.y - 8, pluto.x - 6, pluto.y - 8, pluto.x - 6, pluto.y - 4)
      context.bezierCurveTo(pluto.x - 6, pluto.y, pluto.x, pluto.y + 4, pluto.x, pluto.y + 6)
      context.bezierCurveTo(pluto.x, pluto.y + 4, pluto.x + 6, pluto.y, pluto.x + 6, pluto.y - 4)
      context.bezierCurveTo(pluto.x + 6, pluto.y - 8, pluto.x, pluto.y - 8, pluto.x, pluto.y - 4)
      context.stroke()
      context.fillStyle = '#9aa8b8'
      context.beginPath()
      context.arc(charon.x, charon.y, 12, 0, Math.PI * 2)
      context.fill()
      context.fillStyle = '#c44536'
      context.beginPath()
      context.arc(charon.x + Math.cos(angle + Math.PI) * 6, charon.y + Math.sin(angle + Math.PI) * 6, 4, 0, Math.PI * 2)
      context.fill()
      if (!reducedMotion) requestAnimationFrame(draw)
    }
    draw()
  }
}
