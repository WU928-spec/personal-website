export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1) * 43758.5453
  return x - Math.floor(x)
}

export function getStarPos(
  id: string,
  saved?: { x?: number; y?: number }
): { x: string; y: string } {
  if (saved?.x !== undefined && saved?.y !== undefined) {
    return { x: `${saved.x}%`, y: `${saved.y}%` }
  }

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


