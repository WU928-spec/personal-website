import { useEffect, useState, type ReactNode } from 'react'
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

const MIN_WAIT_MS = 800
const MAX_WAIT_MS = 5000
const ASSET_TIMEOUT = 15000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | void> {
  return Promise.race([
    promise,
    new Promise<void>((resolve) => setTimeout(resolve, ms)),
  ])
}

function loadAsset(url: string): Promise<HTMLImageElement | HTMLMediaElement | void> {
  return new Promise((resolve) => {
    const ext = url.split('.').pop()?.toLowerCase()

    // 图片：先 attach 事件再设 src，并等待解码完成
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')) {
      const img = new Image()

      const finish = () => {
        img.onload = null
        img.onerror = null
        resolve(img)
      }

      img.onload = () => {
        if ('decode' in img && typeof img.decode === 'function') {
          img.decode().then(finish).catch(finish)
        } else {
          finish()
        }
      }
      img.onerror = finish
      img.src = url
      return
    }

    // 音频/视频：用原生媒体元素预加载，设兜底超时避免某些浏览器不触发 canplaythrough
    const isAudio = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(ext || '')
    const media = isAudio
      ? (new Audio() as HTMLAudioElement | HTMLVideoElement)
      : document.createElement('video')

    media.preload = 'auto'
    media.muted = true
    media.src = url

    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      media.oncanplaythrough = null
      media.onloadedmetadata = null
      media.onerror = null
      media.onstalled = null
      resolve(media)
    }

    media.oncanplaythrough = finish
    media.onloadedmetadata = finish
    media.onerror = finish
    media.onstalled = finish
    media.load()

    // 兜底：即使事件未触发，也视为完成，避免卡住预加载器
    setTimeout(finish, ASSET_TIMEOUT)
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
  const [ready, setReady] = useState(false)
  const [loaded, setLoaded] = useState(0)
  const total = PRELOAD_ASSETS.length
  const progress = total > 0 ? Math.round((loaded / total) * 100) : 100

  useEffect(() => {
    let cancelled = false
    let entered = false

    const enter = () => {
      if (entered || cancelled) return
      entered = true
      setReady(true)
    }

    // 数据必须加载完成；失败也由页面自身兜底
    const dataPromise = preloadData().catch(() => {})

    // 资源后台预加载，不阻塞进入页面
    Promise.all(
      PRELOAD_ASSETS.map((url) =>
        withTimeout(loadAsset(url), ASSET_TIMEOUT)
          .catch(() => {})
          .finally(() => {
            if (!cancelled) {
              setLoaded((prev) => Math.min(prev + 1, total))
            }
          })
      )
    ).then(() => {
      // 如果全部资源很快加载完，可以比 MAX_WAIT_MS 更早进入
      if (!cancelled) enter()
    })

    // 至少等待数据和最小视觉时间，避免闪烁
    Promise.all([dataPromise, new Promise<void>((r) => setTimeout(r, MIN_WAIT_MS))]).then(() => {
      if (!cancelled) enter()
    })

    // 全局兜底：无论如何最多等 5 秒，必须进入页面，防止任何原因卡死
    const globalTimer = setTimeout(() => {
      if (!cancelled) enter()
    }, MAX_WAIT_MS)

    return () => {
      cancelled = true
      clearTimeout(globalTimer)
    }
  }, [total])

  return (
    <AnimatePresence mode="wait">
      {!ready ? (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050508] text-white"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-6 w-full max-w-md px-8"
          >
            <div className="text-center space-y-2">
              <h1 className="text-xl font-body tracking-[0.3em] text-white/90">正在装载星光</h1>
              <p className="text-xs text-white/40 font-body tracking-widest">{progress}%</p>
            </div>

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
