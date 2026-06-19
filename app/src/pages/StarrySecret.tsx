import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic'
import { getMemoirs, getStarrySecret, type StarrySecret } from '@/data/memoirs'

const CLICKED_KEY = 'starry-bright-clicked'

function loadClickedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(CLICKED_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return new Set(parsed)
    }
  } catch {
    // ignore
  }
  return new Set()
}

export default function StarrySecret() {
  const navigate = useNavigate()
  useBackgroundMusic('/secret-music.mp3')
  const [secret, setSecret] = useState<StarrySecret | null>(null)
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)

  useEffect(() => {
    Promise.all([getMemoirs(), getStarrySecret()]).then(([memoirs, secretData]) => {
      const brightIds = memoirs.filter((m) => m.brightness >= 1).map((m) => m.id)
      const clickedIds = loadClickedIds()
      const allClicked = brightIds.length > 0 && brightIds.every((id) => clickedIds.has(id))

      if (!allClicked) {
        navigate('/starry', { replace: true })
        return
      }

      setSecret(secretData)
      setVerified(true)
      setLoading(false)
    })
  }, [navigate])

  const pages = secret?.pages ?? []
  const total = pages.length
  const isLastPage = page === total - 1
  const hasPrev = page > 0

  const goNext = () => {
    if (isLastPage) {
      navigate('/starry', { state: { playVideo: true } })
    } else {
      setPage((p) => Math.min(total - 1, p + 1))
    }
  }

  const goPrev = () => {
    setPage((p) => Math.max(0, p - 1))
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isLastPage, total])

  if (loading || !verified) {
    return (
      <div className="relative w-screen h-screen flex items-center justify-center bg-[#2a2320]">
        <div className="text-white/50 text-sm font-body tracking-widest">正在展开这封信…</div>
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="relative w-screen h-screen flex items-center justify-center bg-[#2a2320]">
        <div className="text-white/50 text-sm font-body">信纸是空的</div>
      </div>
    )
  }

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/letter-bg.png)' }}
    >
      {/* 文字区域：浮在花海左上方 */}
      <div className="absolute inset-0 flex justify-center md:justify-start md:pl-[6vw] lg:pl-[8vw] pt-[4vh] md:pt-[8vh]">
        <div className="relative w-full max-w-[min(90vw,460px)] md:max-w-[360px] lg:max-w-[400px] px-6 md:px-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {secret?.title && page === 0 && (
                <h1 className="text-white font-body text-[clamp(0.75rem,2.8vw,1.05rem)] tracking-[0.25em] mb-2 md:mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  {secret.title}
                </h1>
              )}

              <p className="text-white font-body text-[clamp(0.7rem,3vw,0.95rem)] leading-[1.65] md:leading-[1.85] whitespace-pre drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                {pages[page]}
              </p>

              <div className="mt-3 md:mt-5 flex items-center justify-between">
                <span className="text-white/70 text-xs font-body tracking-widest drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                  {page + 1} / {total}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={!hasPrev}
                    className="text-white/80 hover:text-white disabled:text-white/30 transition-colors"
                    aria-label="上一页"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {isLastPage ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="text-white hover:text-yellow-200 transition-colors drop-shadow-[0_0_10px_rgba(255,255,200,0.6)] animate-starGlow"
                      aria-label="点亮星空"
                    >
                      <Star size={20} fill="currentColor" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={goNext}
                      className="text-white/80 hover:text-white transition-colors"
                      aria-label="下一页"
                    >
                      <ChevronRight size={20} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
