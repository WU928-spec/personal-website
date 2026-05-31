export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1) * 43758.5453
  return x - Math.floor(x)
}

export function getStarPos(id: string): { x: string; y: string } {
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

export function compressImage(base64: string, maxWidth = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ratio = Math.min(maxWidth / img.width, 1)
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('canvas error'))
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = base64
  })
}
