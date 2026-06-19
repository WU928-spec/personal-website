export interface Memoir {
  id: string
  title: string
  date: string
  content: string
  brightness: number // 0.1 ~ 1.0，越激动越亮
  image?: string // deprecated，向后兼容
  images?: string[]
  x?: number // 0 ~ 100，屏幕宽度百分比
  y?: number // 0 ~ 100，屏幕高度百分比
}

const STATIC_MEMOIRS_URL = '/memoirs.json'

let cachedMemoirs: Memoir[] | null = null
let cachePromise: Promise<Memoir[]> | null = null

export const DEFAULT_MEMOIRS: Memoir[] = [
  {
    id: '1',
    title: '第一次看见极光',
    date: '2023-11-15',
    content:
      '那是凌晨三点，整个天空突然活了过来。绿色的光带从地平线升起，像一匹绸缎被无形的手抖开。我站在零下二十度的雪地里，呼吸凝结成白雾，却感觉不到冷。光在跳舞，很慢，很慢，仿佛时间也被冻住了。我想喊旁边的人看，转头却发现自己的声音被吞没在辽阔的寂静里。那一刻我明白了，有些震撼是无法分享的，你只能独自吞咽，然后带着它走完余生。',
    brightness: 0.95,
  },
]

function migrateMemoir(m: Memoir): Memoir {
  if (m.image && !m.images) {
    return { ...m, images: [m.image] }
  }
  return m
}

/**
 * 读取静态 memoirs.json 文件。
 * 同一次会话内缓存，避免主界面和详情页重复请求。
 * 失败时回退到默认值。
 */
export async function getMemoirs(): Promise<Memoir[]> {
  if (cachedMemoirs) return cachedMemoirs
  if (cachePromise) return cachePromise

  cachePromise = (async () => {
    try {
      const res = await fetch(STATIC_MEMOIRS_URL)
      if (!res.ok) throw new Error('fetch failed')

      const data = (await res.json()) as unknown
      if (!Array.isArray(data)) throw new Error('invalid format')

      cachedMemoirs = (data as Record<string, unknown>[]).map((row) =>
        migrateMemoir({
          id: String(row.id),
          title: String(row.title ?? ''),
          date: String(row.date ?? ''),
          content: String(row.content ?? ''),
          brightness: Number(row.brightness ?? 0.5),
          images: Array.isArray(row.images) ? (row.images as string[]) : undefined,
          x: row.x !== null && row.x !== undefined ? Number(row.x) : undefined,
          y: row.y !== null && row.y !== undefined ? Number(row.y) : undefined,
        })
      )
      return cachedMemoirs
    } catch {
      return DEFAULT_MEMOIRS
    } finally {
      cachePromise = null
    }
  })()

  return cachePromise
}

// 为每颗 memoir 生成固定的随机坐标，避免每次渲染位置变化
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 127.1) * 43758.5453
  return x - Math.floor(x)
}

export const getStarPosition = (id: string, width: number, height: number) => {
  const seed = parseInt(id, 10)
  const margin = 80
  const x = margin + seededRandom(seed * 1.1) * (width - margin * 2)
  const y = margin + seededRandom(seed * 2.3) * (height - margin * 2)
  return { x, y }
}
