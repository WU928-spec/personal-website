import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Play, Pause, SkipForward, SkipBack, Shuffle, Volume2, Plus, X, Trash2 } from 'lucide-react'
import { getTracks, addTrack, removeTrack, fileToBase64, type Track } from '@/data/music'

const DEFAULT_TRACK: Track = {
  id: 'default-nuna',
  title: 'NUNA',
  artist: '队长',
  data: '/bg-music.mp3',
}

export default function MusicPlayer() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const allTracks = useMemo(() => (tracks.length > 0 ? tracks : [DEFAULT_TRACK]), [tracks])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShuffled, setIsShuffled] = useState(true)
  const [volume, setVolume] = useState(0.5)
  const [isOpen, setIsOpen] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playNextRef = useRef<() => void>(() => {})
  const hasAutoStartedRef = useRef(false)

  // 首次用户交互后自动播放（浏览器禁止无交互自动发声）
  useEffect(() => {
    const startOnInteraction = () => {
      if (hasAutoStartedRef.current) return
      hasAutoStartedRef.current = true
      if (allTracks.length > 0 && !isPlaying) {
        setIsPlaying(true)
      }
    }
    window.addEventListener('pointerdown', startOnInteraction, { once: true })
    window.addEventListener('keydown', startOnInteraction, { once: true })
    return () => {
      window.removeEventListener('pointerdown', startOnInteraction)
      window.removeEventListener('keydown', startOnInteraction)
    }
  }, [allTracks.length, isPlaying])

  // 加载 tracks
  useEffect(() => {
    getTracks().then((t) => {
      setTracks(t)
      setHasLoaded(true)
    })
  }, [])

  // 初始化 audio
  useEffect(() => {
    const audio = new Audio()
    audio.volume = volume
    audioRef.current = audio
    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [])

  // 播放当前 track
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !allTracks.length || !hasLoaded) return
    const track = allTracks[currentIndex]
    if (!track) return
    if (audio.src !== track.data) {
      audio.src = track.data
    }
    // 只有一首默认背景音乐时循环播放
    audio.loop = allTracks.length === 1
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    }
  }, [currentIndex, allTracks, hasLoaded, isPlaying])

  // 播放/暂停状态切换
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !allTracks.length) return
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying, allTracks.length])

  // 音量
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // 下一首逻辑（只有一首时靠 audio.loop 循环，不停止）
  const playNext = () => {
    if (allTracks.length <= 1) {
      return
    }
    if (isShuffled) {
      let next = Math.floor(Math.random() * allTracks.length)
      while (next === currentIndex && allTracks.length > 1) {
        next = Math.floor(Math.random() * allTracks.length)
      }
      setCurrentIndex(next)
    } else {
      setCurrentIndex((prev) => (prev + 1) % allTracks.length)
    }
    setIsPlaying(true)
  }

  playNextRef.current = playNext

  // 播放结束 -> 下一首
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const handleEnded = () => playNextRef.current()
    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [])

  const playPrev = () => {
    if (allTracks.length <= 1) return
    setCurrentIndex((prev) => (prev - 1 + allTracks.length) % allTracks.length)
    setIsPlaying(true)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const base64 = await fileToBase64(file)
    // 去掉后缀
    const rawName = file.name.replace(/\.(mp3|flac)$/i, '')
    // 按 " - " 分割艺术家和歌曲名
    const parts = rawName.split(' - ')
    let title = rawName
    let artist = '未知艺术家'
    if (parts.length >= 2) {
      artist = parts[0].trim()
      title = parts.slice(1).join(' - ').trim()
    }
    const track: Track = {
      id: Date.now().toString(),
      title,
      artist,
      data: base64,
    }
    await addTrack(track)
    const updated = await getTracks()
    setTracks(updated)
    if (updated.length === 1) {
      setCurrentIndex(0)
      setIsPlaying(true)
    }
    e.target.value = ''
  }

  const handleDelete = async (id: string) => {
    if (id === DEFAULT_TRACK.id) return
    await removeTrack(id)
    const updated = await getTracks()
    setTracks(updated)
    const newAllTracks = updated.length > 0 ? updated : [DEFAULT_TRACK]
    if (currentIndex >= newAllTracks.length) {
      setCurrentIndex(0)
    }
    if (updated.length === 0) {
      setIsPlaying(false)
    }
  }

  const currentTrack = allTracks[currentIndex]

  if (!hasLoaded) return null

  return (
    <>
      {/* 折叠按钮 */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors shadow-lg"
        >
          <Music size={20} />
          {isPlaying && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-Amber rounded-full animate-pulse" />
          )}
        </motion.button>
      )}

      {/* 展开面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-80 bg-black/80 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-sm font-medium text-white/90">音乐</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* 当前播放 */}
            <div className="px-4 py-4">
              {currentTrack ? (
                <div className="text-center mb-4">
                  <p className="text-white font-medium truncate">{currentTrack.title}</p>
                  <p className="text-white/40 text-xs truncate">{currentTrack.artist}</p>
                </div>
              ) : (
                <div className="text-center text-white/40 text-sm py-4">暂无音乐，请上传 MP3</div>
              )}

              {/* 控制按钮 */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={() => setIsShuffled(!isShuffled)}
                  className={`p-2 rounded-full transition-colors ${isShuffled ? 'text-Amber bg-Amber/20' : 'text-white/40 hover:text-white/70'}`}
                  title="随机播放"
                >
                  <Shuffle size={16} />
                </button>
                <button
                  onClick={playPrev}
                  disabled={allTracks.length <= 1}
                  className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
                >
                  <SkipBack size={20} />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={!currentTrack}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors disabled:opacity-30"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                </button>
                <button
                  onClick={playNext}
                  disabled={allTracks.length <= 1}
                  className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
                >
                  <SkipForward size={20} />
                </button>
              </div>

              {/* 音量 */}
              <div className="flex items-center gap-2 mb-4">
                <Volume2 size={14} className="text-white/40" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: 'white' }}
                />
              </div>

              {/* 上传 */}
              <div className="mb-3">
                <label className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white/90 text-sm cursor-pointer transition-colors">
                  <Plus size={14} />
                  <span>上传 MP3</span>
                  <input type="file" accept="audio/mp3,audio/mpeg,audio/flac,audio/*" onChange={handleUpload} className="hidden" />
                </label>
              </div>

              {/* 播放列表 */}
              <div className="max-h-32 overflow-y-auto space-y-1 no-scrollbar">
                {allTracks.map((t, i) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setCurrentIndex(i)
                      setIsPlaying(true)
                    }}
                    className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${i === currentIndex ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}
                  >
                    <span className="truncate flex-1">{t.title}</span>
                    {t.id !== DEFAULT_TRACK.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(t.id)
                        }}
                        className="text-white/30 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
