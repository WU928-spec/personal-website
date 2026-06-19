import { useEffect, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  preloadMemoirs,
  preloadStarrySecret,
  type Memoir,
  type StarrySecret,
} from '../data/memoirs.ts'

// 需要预加载的站点资源（图片、音频、视频）
const PRELOAD_ASSETS: string[] = [
  '/about-hero.jpg',
  '/about-timeline-1.jpg',
  '/about-timeline-2.jpg',
  '/about-timeline-3.jpg',
  '/avatar.jpg',
  '/bg-music.mp3',
  '/epilogue-music.mp3',
  '/blog-hero.jpg',
  '/blog-thumb-1.jpg',
  '/blog-thumb-2.jpg',
  '/blog-thumb-3.jpg',
  '/blog-thumb-4.jpg',
  '/blog-thumb-5.jpg',
  '/blog-thumb-6.jpg',
  '/chen_tong_diagnosis_wide.jpg',
  '/chen_tong_wide.jpg',
  '/golden-glasses.png',
  '/hero-bg.jpg',
  '/letter-bg.jpg',
  '/meteorite.jpg',
  '/next-video.mp4',
  '/pluto_crying.jpg',
  '/projects-hero.jpg',
  '/secret-music.mp3',
  '/starry-bg.jpg',
  '/starry-images/1-0.jpg',
  '/starry-images/1-1.jpg',
  '/starry-video.mp4',
]

function loadAsset(url: string): Promise<void> {
  return new Promise((resolve) => {
    const ext = url.split('.').pop()?.toLowerCase()
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')

    if (isImage) {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => resolve()
      img.src = url
      return
    }

    // 音频/视频使用 fetch 预取到缓存
    fetch(url, { method: 'GET', cache: 'force-cache' })
      .then(() => resolve())
      .catch(() => resolve())
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
      // 并发加载媒体资源，每完成一个更新进度；同时预加载页面数据
      await Promise.all([
        Promise.all(
          PRELOAD_ASSETS.map(async (url) => {
            await loadAsset(url)
            if (!cancelled) {
              setLoaded((prev) => Math.min(prev + 1, total))
            }
          })
        ),
        preloadData(),
      ])

      if (!cancelled) finish()
    }

    loadAll()

    return () => {
      cancelled = true
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
