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
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center bg-no-repeat flex items-center justify-center md:justify-end md:pr-[4vw] lg:pr-[8vw]"
      style={{ backgroundImage: 'url(/letter-bg.png)' }}
    >
      {/* 轻微暗角，让信纸更突出 */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_50%,transparent_0%,rgba(0,0,0,0.25)_100%)]" />

      {/* 信件容器：A4 比例，限制高度避免顶到上下边缘 */}
      <div
        className="relative z-10 w-full max-w-[min(86vw,420px)] max-h-[72vh] drop-shadow-[0_16px_44px_rgba(0,0,0,0.22)]"
        style={{ aspectRatio: '210 / 297' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0 rounded overflow-hidden"
            style={{
              backgroundColor: '#fdfbf5',
              backgroundImage: `
                linear-gradient(90deg, transparent 43px, rgba(232, 180, 180, 0.42) 43px, rgba(232, 180, 180, 0.42) 44px, transparent 44px),
                repeating-linear-gradient(
                  transparent,
                  transparent 31px,
                  rgba(164, 176, 190, 0.32) 31px,
                  rgba(164, 176, 190, 0.32) 32px
                )
              `,
              backgroundSize: '100% 100%, 100% 32px',
            }}
          >
            <div className="h-full px-7 sm:px-9 pt-7 pb-14 pl-[52px] sm:pl-[58px]">
              {/* 称呼 / 标题 */}
              {secret?.title && (
                <h1 className="text-[#4a443d] font-body text-[clamp(0.85rem,3.4vw,1rem)] tracking-[0.2em] leading-[32px] mb-[32px]">
                  {secret.title}
                </h1>
              )}

              {/* 正文：对齐行线 */}
              <p className="text-[#3d3832] font-body text-[clamp(0.8rem,3vw,0.95rem)] leading-[32px] whitespace-pre-line">
                {pages[page]}
              </p>
            </div>

            {/* 页码 */}
            <div className="absolute bottom-5 right-7 text-[#a8a095] text-xs font-body tracking-widest">
              {page + 1} / {total}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 翻页控制 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-8 bg-black/25 backdrop-blur-sm px-6 py-3 rounded-full">
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
