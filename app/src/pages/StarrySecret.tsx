import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setPage((p) => Math.max(0, p - 1))
      if (e.key === 'ArrowRight') setPage((p) => Math.min((secret?.pages.length ?? 1) - 1, p + 1))
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [secret?.pages.length])

  const pages = secret?.pages ?? []
  const total = pages.length
  const hasPrev = page > 0
  const hasNext = page < total - 1

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
      {/* 文字区域：浮在花海偏左位置 */}
      <div className="absolute inset-0 flex items-center justify-center md:justify-start md:pl-[12vw] lg:pl-[16vw]">
        <div className="relative w-full max-w-[min(88vw,520px)] md:max-w-[420px] lg:max-w-[460px] px-6 md:px-0 -translate-y-[2vh] md:-translate-y-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {secret?.title && page === 0 && (
                <h1 className="text-white font-body text-[clamp(1rem,4vw,1.35rem)] tracking-[0.25em] mb-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  {secret.title}
                </h1>
              )}

              <p className="text-white font-body text-[clamp(1rem,4vw,1.25rem)] leading-[2.2] whitespace-pre-line drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                {pages[page]}
              </p>

              <div className="mt-8 text-white/70 text-xs font-body tracking-widest drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                {page + 1} / {total}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 翻页控制 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-8 bg-black/25 backdrop-blur-sm px-6 py-3 rounded-full">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={!hasPrev}
          className="flex items-center gap-1 text-white/90 hover:text-white disabled:text-white/40 transition-colors font-body text-sm"
        >
          <ChevronLeft size={18} />
          <span>上一页</span>
        </button>

        <button
          onClick={() => navigate('/starry')}
          className="text-white/80 hover:text-white transition-colors font-body text-sm tracking-widest"
        >
          返回星空
        </button>

        <button
          onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
          disabled={!hasNext}
          className="flex items-center gap-1 text-white/90 hover:text-white disabled:text-white/40 transition-colors font-body text-sm"
        >
          <span>下一页</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
