import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  preloadMemoirs,
  preloadStarrySecret,
  type Memoir,
  type StarrySecret,
} from '../data/memoirs.ts'

// 仅预加载星空彩蛋相关资源（预加载器已限定在 /starry/* 路由）
const PRELOAD_ASSETS: string[] = [
  '/bg-music.mp3',
  '/epilogue-music.mp3',
  '/secret-music.mp3',
  '/starry-bg.jpg',
  '/starry-images/1-0.jpg',
  '/starry-images/1-1.jpg',
  '/starry-video.mp4',
  '/letter-bg.jpg',
  '/golden-glasses.png',
  '/next-video.mp4',
]

function loadAsset(url: string): Promise<HTMLImageElement | HTMLMediaElement | void> {
  return new Promise((resolve) => {
    const ext = url.split('.').pop()?.toLowerCase()

    // 图片：用 Image 对象预加载，并等待解码完成，确保进入页面后能立即渲染
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')) {
      const img = new Image()
      img.src = url

      const finish = () => resolve(img)
      const fallbackFinish = () => {
        img.onload = null
        img.onerror = null
        finish()
      }

      if ('decode' in img && typeof img.decode === 'function') {
        img.decode().then(fallbackFinish).catch(fallbackFinish)
      } else {
        img.onload = fallbackFinish
        img.onerror = fallbackFinish
      }
      return
    }

    // 音频/视频：用原生媒体元素预加载，浏览器会按媒体策略缓存并准备播放
    const isAudio = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(ext || '')
    const media = isAudio
      ? (new Audio() as HTMLAudioElement | HTMLVideoElement)
      : document.createElement('video')

    media.preload = 'auto'
    media.muted = true
    media.src = url

    const finish = () => {
      media.oncanplaythrough = null
      media.onerror = null
      media.onstalled = null
      resolve(media)
    }

    media.oncanplaythrough = finish
    media.onerror = finish
    media.onstalled = finish

    // 部分浏览器不会自动开始加载，手动触发
    media.load()
  })
}

/** 预先把星空页数据解析进内存缓存，避免进入页面后二次 loading */
async function preloadData(): Promise<void> {
  try {
    const [memoirsRes, secretRes] = await Promise.all([
      fetch('/memoirs.json?v=2', { method: 'GET', cache: 'force-cache' }),
      fetch('/starry-secret.json', { method: 'GET', cache: 'force-cache' }),
    ])

    if (memoirsRes.ok) {
      const data = (await memoirsRes.json()) as unknown
      if (Array.isArray(data)) preloadMemoirs(data as Memoir[])
    }

    if (secretRes.ok) {
      const data = (await secretRes.json()) as unknown
      if (data && typeof data === 'object') {
        preloadStarrySecret(data as StarrySecret)
      }
    }
  } catch {
    // 数据预加载失败由页面自身兜底
  }
}

interface PreloaderProps {
  children: ReactNode
}

export default function Preloader({ children }: PreloaderProps) {
  const [loaded, setLoaded] = useState(0)
  const [done, setDone] = useState(false)
  const assetsRef = useRef<(HTMLImageElement | HTMLMediaElement)[]>([])
  const total = PRELOAD_ASSETS.length
  const progress = total > 0 ? Math.round((loaded / total) * 100) : 100

  useEffect(() => {
    let cancelled = false

    const finish = () => {
      if (cancelled) return
      // 进度条到达 100% 后短暂停顿再进入，视觉更完整
      setTimeout(() => setDone(true), 400)
    }

    const loadAll = async () => {
      // 限制并发数，避免一次性发起过多请求导致网络拥塞或失败
      const concurrency = 4
      const queue = [...PRELOAD_ASSETS]
      const workers = Array.from({ length: concurrency }, async () => {
        while (queue.length > 0) {
          const url = queue.shift()
          if (!url) break
          const asset = await loadAsset(url)
          if (asset) assetsRef.current.push(asset)
          if (!cancelled) {
            setLoaded((prev) => Math.min(prev + 1, total))
          }
        }
      })

      await Promise.all([Promise.all(workers), preloadData()])

      if (!cancelled) finish()
    }

    loadAll()

    return () => {
      cancelled = true
      assetsRef.current = []
    }
  }, [total])

  return (
    <AnimatePresence mode="wait">
      {!done ? (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050508] text-white"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6 w-full max-w-md px-8"
          >
            <div className="text-center space-y-2">
              <h1 className="text-xl font-body tracking-[0.3em] text-white/90">正在装载星光</h1>
              <p className="text-xs text-white/40 font-body tracking-widest">
                {progress}%
              </p>
            </div>

            {/* 进度条轨道 */}
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-white/60 to-white/90 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>

            <p className="text-xs text-white/30 font-body tracking-widest">
              请稍候，所有记忆即将呈现
            </p>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
