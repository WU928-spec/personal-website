import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Move, Pin, Settings, Cloud, CloudOff, CheckCircle2, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getMemoirs, saveMemoirs, syncMemoirsToCloud, type Memoir } from '@/data/memoirs'
import { getStarPos } from '@/utils/starry'
import { useAutoPlayVideo } from '@/hooks/useAutoPlayVideo'
import DraggableStar from '@/components/starry/DraggableStar'
import MemoirManager from '@/components/starry/MemoirManager'

export default function StarryEasterEgg() {
  const navigate = useNavigate()
  const [showText, setShowText] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [draggable, setDraggable] = useState(true)
  const [showManager, setShowManager] = useState(false)
  const [memoirs, setMemoirs] = useState<Memoir[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle')
  const [isBackgroundSyncing, setIsBackgroundSyncing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const refreshMemoirs = useCallback(async () => {
    const list = await getMemoirs()
    setMemoirs(list)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refreshMemoirs()
  }, [refreshMemoirs])

  useEffect(() => {
    const onSyncStart = () => setIsBackgroundSyncing(true)
    const onSyncDone = () => {
      setIsBackgroundSyncing(false)
      refreshMemoirs()
    }

    window.addEventListener('starry-sync-started', onSyncStart)
    window.addEventListener('starry-sync-completed', onSyncDone)
    return () => {
      window.removeEventListener('starry-sync-started', onSyncStart)
      window.removeEventListener('starry-sync-completed', onSyncDone)
    }
  }, [refreshMemoirs])

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 400)
    return () => clearTimeout(timer)
  }, [])

  useAutoPlayVideo(videoRef, showVideo)

  const handleChange = useCallback((next: Memoir[]) => {
    saveMemoirs(next)
      .then(() => {
        setMemoirs(next)
        setSaveError(null)
      })
      .catch(() => {
        setSaveError('保存失败：存储空间已满')
      })
  }, [])

  const handlePositionChange = useCallback(
    (id: string, x: number, y: number) => {
      setMemoirs((prev) => {
        const idx = prev.findIndex((item) => item.id === id)
        if (idx === -1) return prev
        const item = prev[idx]
        if (item.x === x && item.y === y) return prev
        const next = [...prev]
        next[idx] = { ...item, x, y }
        saveMemoirs(next).catch(() => {})
        return next
      })
    },
    []
  )

  const handleSyncToCloud = useCallback(async () => {
    setSyncStatus('syncing')
    const ok = await syncMemoirsToCloud()
    setSyncStatus(ok ? 'synced' : 'error')
    setTimeout(() => setSyncStatus('idle'), 2500)
  }, [])

  const stars = useMemo(
    () =>
      memoirs.map((m) => {
        const pos = getStarPos(m.id, { x: m.x, y: m.y })
        return (
          <DraggableStar
            key={m.id}
            memoir={m}
            x={pos.x}
            y={pos.y}
            draggable={draggable}
            onPositionChange={handlePositionChange}
          />
        )
      }),
    [memoirs, draggable, handlePositionChange]
  )

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050508]">
      {/* 背景图 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/starry-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* 全屏视频 */}
      <video
        ref={videoRef}
        src="/starry-video.mp4"
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover z-[1] transition-opacity duration-700 ${showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onEnded={() => setShowVideo(false)}
        onClick={() => setShowVideo(false)}
      />

      {/* 星星层 */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-700 ${showVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        {stars}
      </div>

      {/* 首屏加载指示器 */}
      {isLoading && (
        <div className="absolute inset-0 z-[25] flex items-center justify-center bg-[#050508]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-white/50">
            <Loader2 size={28} className="animate-spin" />
            <span className="text-sm font-body tracking-widest">正在载入星空...</span>
          </div>
        </div>
      )}

      {/* 后台同步指示器 */}
      {isBackgroundSyncing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 text-white/40"
        >
          <Loader2 size={12} className="animate-spin" />
          <span className="text-xs font-body">同步云端位置中...</span>
        </motion.div>
      )}

      {/* UI 层 */}
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

      {showText && !isBackgroundSyncing && (
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

      {/* 切换拖动模式 */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        onClick={() => setDraggable((v) => !v)}
        className="absolute top-6 right-6 z-30 flex items-center gap-2 text-white/60 hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 hover:scale-105"
        title={draggable ? '切换为固定模式' : '切换为拖动模式'}
      >
        {draggable ? <Move size={16} /> : <Pin size={16} />}
        <span className="text-sm font-body">{draggable ? '可拖动' : '已固定'}</span>
      </motion.button>

      {/* 管理记忆按钮 */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
        onClick={() => setShowManager(true)}
        className="absolute bottom-24 left-8 z-30 flex items-center gap-2 text-white/60 hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/5 px-5 py-3 rounded-full border border-white/10 hover:bg-white/10 hover:scale-105"
      >
        <Settings size={16} />
        <span className="text-sm font-body">管理记忆</span>
      </motion.button>

      {/* 同步到云端按钮 */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        onClick={handleSyncToCloud}
        disabled={syncStatus === 'syncing'}
        className="absolute bottom-8 left-8 z-30 flex items-center gap-2 text-white/60 hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {syncStatus === 'syncing' && <Loader2 size={14} className="animate-spin" />}
        {syncStatus === 'idle' && <Cloud size={14} />}
        {syncStatus === 'synced' && <CheckCircle2 size={14} className="text-emerald-400" />}
        {syncStatus === 'error' && <CloudOff size={14} className="text-red-400" />}
        <span className="text-sm font-body">
          {syncStatus === 'syncing' && '同步中...'}
          {syncStatus === 'synced' && '已同步'}
          {syncStatus === 'error' && '同步失败'}
          {syncStatus === 'idle' && '同步到云端'}
        </span>
      </motion.button>

      {/* 播放视频按钮 */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        onClick={() => setShowVideo(true)}
        className="absolute bottom-24 right-8 z-30 flex items-center gap-2 text-white/60 hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/5 px-5 py-3 rounded-full border border-white/10 hover:bg-white/10 hover:scale-105"
      >
        <Play size={16} fill="currentColor" />
        <span className="text-sm font-body">观看星轨</span>
      </motion.button>

      {/* 管理抽屉 */}
      <AnimatePresence>
        {showManager && (
          <MemoirManager
            memoirs={memoirs}
            onChange={handleChange}
            onClose={() => setShowManager(false)}
            saveError={saveError}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
